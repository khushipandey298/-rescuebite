@echo off
echo Rescue Bite - GitHub Push Script
echo ==============================
echo.
echo Step 1: Remove current remote...
"C:\Program Files\Git\bin\git.exe" remote remove origin

echo.
echo Step 2: Please enter your GitHub Personal Access Token:
set /p token="Token: "

echo.
echo Step 3: Adding remote with token...
"C:\Program Files\Git\bin\git.exe" remote add origin https://%token%@github.com/khushipandey298/rescuebite.git

echo.
echo Step 4: Pushing to GitHub...
"C:\Program Files\Git\bin\git.exe" push -u origin master

echo.
echo Done! Check your repository at: https://github.com/khushipandey298/rescuebite
pause
