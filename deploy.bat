@echo off
REM ECO Deploy Script
REM Run from C:\Users\vbaks\OneDrive\Documents\Websites\ECO\Website\
REM Safe to run after extracting full zip — exclusions are handled below.

echo.
echo === ECO Deploy ===
echo.

REM Stage all HTML, JS, CSS, docs
git add *.html
git add *.js
git add *.css
git add docs\*.md
git add ECO_SESSION_STATE.md
git add *.sql 2>nul
git add sql\*.sql 2>nul
git add supabase\functions\*\*.ts 2>nul
git add .cpanel.yml 2>nul

REM ---------------------------------------------------------------
REM SAFETY: Never stage images, textures, or binary assets.
REM These folders only exist on the server and are never in the zip.
REM Extracting a full zip will NOT create them, but git add -A would
REM try to delete them. The explicit add list above prevents this.
REM ---------------------------------------------------------------
git reset HEAD images\ >nul 2>&1
git reset HEAD textures\ >nul 2>&1
git reset HEAD *.png >nul 2>&1
git reset HEAD *.jpg >nul 2>&1
git reset HEAD *.jpeg >nul 2>&1
git reset HEAD *.gif >nul 2>&1
git reset HEAD *.webp >nul 2>&1
git reset HEAD *.ico >nul 2>&1
git reset HEAD *.mp4 >nul 2>&1
git reset HEAD *.mov >nul 2>&1
git reset HEAD *.zip >nul 2>&1

REM ---------------------------------------------------------------
REM SAFETY: Never overwrite real edge function source with placeholders.
REM If a functions\index.ts contains the placeholder warning, unstage it.
REM ---------------------------------------------------------------
for %%F in (supabase\functions\001_claude-proxy\index.ts supabase\functions\002_stripe-create-checkout\index.ts supabase\functions\003_stripe-webhook\index.ts supabase\functions\004_quest-generator\index.ts) do (
  if exist "%%F" (
    findstr /C:"SOURCE NOT YET RETRIEVED" "%%F" >nul 2>&1
    if not errorlevel 1 (
      echo WARNING: %%F is a placeholder - unstaging
      git reset HEAD "%%F" >nul 2>&1
    )
  )
)

REM Re-stage deploy.bat itself (resets above may have caught it)
git add deploy.bat >nul 2>&1

REM Show what will be committed
echo.
echo Files staged for commit:
git diff --cached --name-only

echo.
set /p MSG="Commit message (or press Enter for auto): "
if "%MSG%"=="" set MSG=ECO update %date%

git commit -m "%MSG%"
git push --force origin master:main

echo.
echo === Done - deployed to eternalcurrent.online ===
pause
