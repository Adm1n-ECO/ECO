@echo off
REM ECO Deploy Script — only stages HTML/JS/CSS/docs, never touches images or textures
REM Run from C:\Users\vbaks\OneDrive\Documents\Websites\ECO\Website\

echo.
echo === ECO Deploy ===
echo.

REM Normalise line endings so git sees real changes
git config core.autocrlf false

REM Stage only the file types Claude edits — never images or textures
git add *.html
git add *.js
git add *.css
git add docs\*.md
git add ECO_SESSION_STATE.md
git add .gitattributes
git add *.sql 2>nul

REM Show what will be committed
echo Files staged for commit:
git status --short

echo.
set /p MSG="Commit message (or press Enter for auto): "
if "%MSG%"=="" set MSG=ECO update %date%

git commit -m "%MSG%"
git push --force origin main

echo.
echo === Done - deployed to eternalcurrent.online ===
pause
