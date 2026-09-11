# improv-sync

A backup and sync endpoint for the webapp, meant to run on a machine of yours
that stays on (a Mac mini, say). Without it the app is local-first only: each
browser keeps its own copy in `localStorage`, the phone and the Mac never see
each other's archive, and iOS Safari may evict the data after about seven days
of not opening the app.

It is one file, `improv-sync.mjs`, with no dependencies and no database. State
is one JSON blob per version on disk, written atomically, with the recent
versions kept so you can roll back.

## What it does and does not do

- Stores the whole app state as a versioned blob. It does not merge at the
  level of single sessions or favourites.
- Refuses a push whose `baseVersion` is stale, so a second device can never
  silently overwrite the first. The app then asks which side to keep, and the
  other side stays in the version list.
- Has no accounts. One bearer token guards everything.
- Listens on `127.0.0.1` only. Anything reaching it comes through Tailscale.

## Run it

```bash
node server/improv-sync.mjs
```

On first start it generates a token, writes it to
`~/.improv-all-in-one/config.json` (mode 600) and prints it. Copy it.

| Variable | Default | Meaning |
| --- | --- | --- |
| `IMPROV_SYNC_PORT` | `8787` | port |
| `IMPROV_SYNC_HOST` | `127.0.0.1` | bind address; leave it alone |
| `IMPROV_SYNC_DIR` | `~/.improv-all-in-one` | where versions are written |
| `IMPROV_SYNC_TOKEN` | generated | overrides the stored token |
| `IMPROV_SYNC_ORIGINS` | GitHub Pages + localhost | comma-separated allowed origins |
| `IMPROV_SYNC_KEEP` | `50` | versions to retain |

## Put it on your tailnet

The app is served over HTTPS from GitHub Pages, and an HTTPS page cannot call a
plain `http://` address: the browser blocks it as mixed content before the
request is made. `tailscale serve` solves both problems at once, giving the
server a real certificate and a stable name, reachable only from your own
devices.

```bash
tailscale serve --bg --https=443 http://127.0.0.1:8787
tailscale serve status        # prints the https://<machine>.<tailnet>.ts.net address
```

Do **not** use `tailscale funnel` here. Funnel publishes to the open internet,
where the token is the only thing between your archive and anyone who finds the
hostname.

## Start it at login

Install the service, which starts the server at login and restarts it if it
ever exits:

```bash
mkdir -p ~/Library/LaunchAgents ~/improv-sync
cp server/improv-sync.mjs ~/improv-sync/
sed "s|__HOME__|$HOME|g" server/com.sandroraffaele.improv-sync.plist \
  > ~/Library/LaunchAgents/com.sandroraffaele.improv-sync.plist
launchctl load ~/Library/LaunchAgents/com.sandroraffaele.improv-sync.plist
```

Check it:

```bash
launchctl list | grep improv-sync         # pid, not just a status code
tail -f ~/improv-sync/improv-sync.log     # the token is printed here on start
curl -s http://127.0.0.1:8787/api/health  # {"ok":true,"service":"improv-sync"}
```

The plist runs `/usr/bin/env node` with a `PATH` covering both Homebrew
locations (`/opt/homebrew/bin` on Apple silicon, `/usr/local/bin` on Intel). If
`which node` prints a path outside those, add its directory to the `PATH` entry
in the plist.

To stop it: `launchctl unload ~/Library/LaunchAgents/com.sandroraffaele.improv-sync.plist`.

`tailscale serve --bg` persists across reboots on its own, so it needs no
service of its own.

## Connect the app

In the app: **Settings → Server & sync**, paste the `https://…ts.net` address
and the token, name the device, **Test connection**, then switch **Sync with my
server** on. Repeat on each device with the same address and token.

After that, changes are pushed in the background about a second and a half
after you stop editing. Pulls are explicit: if another device has saved since,
the panel says so and offers **Pull from server**. If both sides changed, the
panel says that too and nothing is overwritten until you choose.

The address and token stay on the device that entered them. They are not part
of the JSON backup and are never copied to another device by a sync.

## API

Every route except `/api/health` needs `Authorization: Bearer <token>`.

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/health` | unauthenticated liveness check |
| `GET` | `/api/meta` | current version, when, from which device |
| `GET` | `/api/state` | latest version with its data; 404 when empty |
| `PUT` | `/api/state` | `{ data, device, baseVersion }`; 409 if stale, `?force=1` to override |
| `GET` | `/api/versions` | recent versions, newest first, without data |
| `GET` | `/api/versions/:n` | one version with its data |

## Backups

The data directory is the backup: `~/.improv-all-in-one/versions/*.json`. Each
file is a complete, self-contained state. Include it in whatever already backs
up the machine, or copy it off periodically. The app's **Export all data
(JSON)** still works and is independent of the server.
