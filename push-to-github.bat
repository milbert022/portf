@echo off
set "PATH=C:\Users\mille\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd;C:\Users\mille\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\ucrt64\bin;%PATH%"
cd /d "%~dp0"
echo ========================================================
echo Pushing portfolio to https://github.com/milbert022/portf
echo ========================================================
git add -A
git commit -m "Update portfolio files"
git push -u origin main
echo.
echo ========================================================
echo Done! Changes pushed to GitHub successfully.
echo ========================================================
pause
