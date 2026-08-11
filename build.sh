#!/bin/bash
set -e

cd frontend
npm run build

cd ..
cp -r ./frontend/dist ./backend/src/main/resources/static

docker build -t my-app .