# Installing UMU Sports on the Tutor's PC

For the person doing the setup. The tutor is not technical — the goal is that
they only ever need to double-click **start.bat** and **stop.bat**.

Time: about 30–45 minutes, most of it waiting for downloads.

---

## Before you start

- The PC needs **Windows 10/11 (64-bit)**, **8 GB RAM**, **~10 GB free disk**.
- You need an **internet connection** (first run downloads the Docker images).
- The user will read `WINDOWS-SETUP.md` for day-to-day use — you only need the
  parts below.

## Checklist

- [ ] **1. Install Git** — https://git-scm.com/download/win — keep defaults, click Next.
- [ ] **2. Install Docker Desktop** — https://www.docker.com/products/docker-desktop/ — keep defaults.
- [ ] **3. Restart the PC** when Docker install finishes.
- [ ] **4. Open Docker Desktop** and wait until it says *Engine running* (first start takes 1–2 min). Leave it open.
- [ ] **5. Create the folder** `C:\sports`.
- [ ] **6. Get the code onto the PC.** Copy the `sports-management-platform` folder from a USB stick into `C:\sports`, **or** from the terminal:
  ```
  cd C:\sports
  git clone https://github.com/edkaydev/sports-management-platform.git
  cd sports-management-platform
  ```
- [ ] **7. Create the hidden settings file** (the code does NOT include it):
  - Open the `backend` folder (turn on View > Show > Hidden items if needed).
  - Right-click `.env.example` > Copy; right-click in the folder > Paste.
  - Rename the copy to exactly **`.env`** (just the dot + "env").
  - Do not open or edit it.
- [ ] **8. Double-click `start.bat`** in the project folder.
- [ ] **9. Wait** until it prints `UMU Sports is running` (first run: 2–5 min).
- [ ] **10. Verify sign-in works:**
  - Browser opens to `localhost:5173`.
  - Username `tutor` / password `Tutor@2025`.
  - On first login it asks to create a new password — do it.
- [ ] **11. Create desktop shortcuts** for the tutor:
  - Right-click `start.bat` > Send to > Desktop (create shortcut). Rename it **"UMU Sports – Start"**.
  - Same for `stop.bat` > rename **"UMU Sports – Stop"**.
  - Same for `kiosk.bat` > rename **"UMU Sports – Full Screen"** (optional).
- [ ] **12. (Optional) Set up auto-start** so the app starts with the PC:
  - Docker Desktop > Settings > *Start Docker Desktop when you sign in* (enable).
  - Copy the "Start" shortcut into **Win + R → `shell:startup` → Enter**.
- [ ] **13. Test the daily flow from the tutor's point of view:**
  - Double-click the desktop **Start** shortcut → wait → app opens → sign in.
  - Double-click the desktop **Stop** shortcut → closing the window.
  - Restart once to be sure everything comes back.
- [ ] **14. Leave the tutor with:**
  - Two (or three) desktop shortcuts.
  - `WINDOWS-SETUP.md` printed or on the desktop as backup instructions.

---

## Hand the tutor this simple summary

> To open the app: double-click the **"UMU Sports – Start"** icon on the desktop,
> wait for the black window to say "running", then sign in with `tutor` and your
> password.
> To close it: double-click **"UMU Sports – Stop"**. Your data is kept.

---

## If something goes wrong during install

| Problem | Fix |
|---|---|
| `start.bat` says Docker did not start | Open Docker Desktop, wait for *Engine running*, run `start.bat` again. |
| First run takes very long | Normal. It is downloading ~2 GB of images. Don't close the window. |
| Page won't load after it says running | Wait 30 s and refresh, or run `start.bat` again. |
| "Port already in use" | Something else uses port 3306/3000/5173. Close it (e.g. another MySQL), then run `start.bat`. |
| `.env` file not visible because no extension | Enable *View > Show > File name extensions* and *Hidden items*. |

After you finish, if the tutor later forgets the password, run from the project folder:

```
docker compose exec api npx prisma db seed
```

and the password resets to `tutor` / `Tutor@2025` (they will be asked to change it again).