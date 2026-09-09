# UMU Sports — How to Open the App (Simple Guide)

This guide has two parts:

1. **"How to open the app every day"** — for the Sports Tutor who is not technical.
   This is all you normally need.
2. **"Setting up on a new PC"** — one-time steps used when the program is first
   put on a computer (usually done by the person who set up the machine).

> The person doing the setup should use **`INSTALLER-CHECKLIST.md`** instead —
> a short step-by-step checklist for putting the app on the tutor's PC.

---

## PART 1 — How to Open the App Every Day (for the non-technical user)

The app has two files that look like this on your desktop or in the project folder:

- **`start.bat`** — opens the app.
- **`stop.bat`** — closes the app (use at the end of the day).

### To open the app

1. Turn on the computer and log in to Windows.
2. Find the **`start.bat`** file (or its shortcut on the desktop). It has a
   gear/cog icon and is called "start".
3. **Double-click it** with the mouse.
4. A black window appears. **Wait.** It shows messages like `Starting database...`
   and `Starting API and app...`. This first time it can take **1–2 minutes**.
   Don't click anything — just wait.
5. When it shows the message below, the app is ready:
   ```
   UMU Sports is running.
   ```
6. A browser page opens automatically. If it doesn't, open a browser yourself
   and type `localhost:5173`.

### Signing in

| Box to fill     | Type this     |
|-----------------|---------------|
| Username        | `tutor`       |
| Password        | `Tutor@2025`  |

- The **first time** only, the app will ask you to **create a new password**.
  Choose one you can remember, type it, and confirm it.
- Afterwards, always sign in with `tutor` and **your own password**.

### When you are finished

Double-click **`stop.bat`**. A black window flashes and closes. The app is off.
**Your saved data is not lost** — the next time you do `start.bat`, everything is
still there.

### If something looks wrong

- If the browser page shows **"can't reach this page"** — wait 30 seconds, click
  the refresh button, or run `start.bat` again.
- If a window says **"Docker did not start"** — just double-click `start.bat`
  again. It usually works the second time.
- If you forget your password — ask the person who set up your computer.

### Putting a shortcut on the desktop (one time, to make it easier)

1. Right-click on the `start.bat` file → **Send to** → **Desktop (create shortcut)**.
2. Do the same for `stop.bat`.
3. Now you can just double-click the shortcuts on the desktop instead of opening
   folders. Everything else stays the same.

---

## PART 2 — Setting Up on a New PC (one-time)

These steps are done once, when the program first goes onto a computer. After
this, the user only needs Part 1.

### What the PC needs

- **Windows 10 or 11** (64-bit)
- **8 GB RAM minimum**
- **About 10 GB free disk space**
- **Internet connection** (first launch only — it downloads the starting files)

### Step 1 — Install Git

1. Download from: https://git-scm.com/download/win
2. Run the installer; click **Next** on every screen.

### Step 2 — Install Docker Desktop

1. Download from: https://www.docker.com/products/docker-desktop/
2. Run the installer (default options are fine).
3. **Restart the PC** when asked.
4. After restart, open **Docker Desktop** (the whale icon) and wait until it says
   "Engine running". (On the very first start this can take a couple of minutes.)
5. Leave Docker Desktop open in the background.

> If Windows asks about WSL2 during install, choose **"Use WSL 2"**.

### Step 3 — Choose where to keep the program

Make a folder called `sports` on the `C:` drive (this is quick, not inside
OneDrive/Documents). For example: `C:\sports`.

### Step 4 — Copy the program folder onto the PC

You can copy the whole `sports-management-platform` folder from a USB stick or
from the old computer straight into `C:\sports`.

**OR** (if the program is on the internet) download it from the command prompt:

```cmd
cd C:\sports
git clone https://github.com/edkaydev/sports-management-platform.git
cd sports-management-platform
```

### Step 5 — Create the small hidden settings file (IMPORTANT)

The program needs a file called **`.env`** inside the `backend` folder. This file
is not included when the program is copied, so you must create it once:

1. Open the `backend` folder in File Explorer.
2. If you cannot see the file `.env.example`, turn on hidden files:
   **View → Show → Hidden items**.
3. Right-click `.env.example` → **Copy**.
4. Right-click the same folder → **Paste**, then right-click the new copy →
   **Rename** and type exactly: **`.env`**
   (nothing before the dot, no extra letters — just `.env`).

Do NOT open or change anything in this file. Its default contents are correct.

### Step 6 — Start the app for the first time

1. Open the `sports-management-platform` folder.
2. Double-click **`start.bat`**.
3. Wait for `UMU Sports is running` and sign in as described in Part 1.

### Step 7 — (Optional) Put shortcuts on the desktop

Do the "Putting a shortcut on the desktop" steps from Part 1 so the user can
start the app easily every day.

> **Tip:** to have the app start by itself whenever the PC is turned on, put
> shortcuts of `start.bat` and `kiosk.bat` in the Startup folder
> (**Win + R**, type `shell:startup`, press Enter), and set Docker Desktop to
> start with Windows (Docker Desktop → Settings → *Start Docker Desktop when you
> sign in*).

---

## Full-Screen (Kiosk) Mode — so nothing else is visible

Use this if the tutor should only see the app with no browser buttons:

1. Run `start.bat` first (as in Part 1).
2. Double-click **`kiosk.bat`** — the app opens in a clean full-screen window.
   To get out of full screen: press **Esc** or **Alt+F4**.

---

## What the different files do

| File           | What it does                       | When                          |
|----------------|------------------------------------|-------------------------------|
| `start.bat`    | Opens the app                      | Every time you use the app    |
| `stop.bat`     | Closes the app (keeps your data)   | End of the day                |
| `kiosk.bat`    | Opens the app full screen          | Optional, everyday use        |
| `start.command`| Same as start.bat, for Mac         | Only if using a Mac           |
| `stop.command` | Same as stop.bat, for Mac          | Only if using a Mac           |

---

## If something is wrong

| Problem                             | What to do                                                                 |
|-------------------------------------|----------------------------------------------------------------------------|
| "Docker is not running / did not start" | Double-click `start.bat` again. If it still fails, open **Docker Desktop**, wait for the whale to stop moving, then run `start.bat`. |
| Page won't load                     | Wait 30 seconds, press refresh, or run `start.bat` again.                  |
| "Port already in use"               | Another program is using the same slot. Close it, then run `start.bat` again. |
| App is slow the first time          | Normal — the first run downloads and builds everything. Be patient once, afterwards it starts faster. |
| Forgot password                     | Ask the person who set up the computer. (For administrators: run `docker compose exec api npx prisma db seed` and sign in with `tutor` / `Tutor@2025`.) |
| Computer runs out of space/time     | Contact the person who set up the system.                                  |