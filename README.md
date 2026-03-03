# WAG PO PAG PUSH SA MAIN PLEASE LANG 

hindi mo madali magbalik ng code
# 🌸 Petal Express -- Ordering & POS System

Hi QA Team 👋

This guide will walk you through EVERYTHING step-by-step.

Even if you have never used Git, Terminal, or MySQL before — just follow this exactly.

Do not skip steps 😊

------------------------------------------------------------

# 🧠 What You Are Running

This system has 3 parts:

- Database (MySQL)
- Backend (Laravel)
- Frontend (React Website)

All three must be running.

------------------------------------------------------------

# ✅ BEFORE YOU START

Please make sure you already installed:

- XAMPP or MySQL Server
- MySQL Workbench
- PHP (8.2+)
- Composer
- Node.js (v18+)
- VS Code

If something is missing, ask first before continuing.

------------------------------------------------------------

# 📥 STEP 1 — DOWNLOAD THE PROJECT

You DO NOT need to know Git.

1. Go to this GitHub link:
   https://github.com/ichigokekiii/Ordering-and-POS-System

2. Click the GREEN "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file to your Desktop
5. Open the extracted folder

You should see:

backend/
frontend/
README.md

------------------------------------------------------------

# 🗄 STEP 2 — SET UP THE DATABASE

This creates the database where data is stored.

------------------------------------------------------------

## 🔹 2.1 Download Files From Google Drive

From the Google Drive I sent:

Download these two files:

• ordering_pos.sql
• .env

Save them somewhere easy (like Desktop).

------------------------------------------------------------

## 🔹 2.2 Open MySQL Workbench

1. Open MySQL Workbench
2. Connect to "Local Instance"

------------------------------------------------------------

## 🔹 2.3 Create the Database

1. Click the "SQL" button (new query tab)
2. Paste this:

CREATE DATABASE ordering_pos;

3. Click the lightning ⚡ button to run it

------------------------------------------------------------

## 🔹 2.4 Import the Database File

1. Go to the top menu → Server → Data Import
2. Select "Import from Self-Contained File"
3. Click the "..." button and choose ordering_pos.sql
4. Under "Default Target Schema" choose ordering_pos
5. Click "Start Import"

Wait until it finishes.

Your database is now ready ✅

------------------------------------------------------------

# ⚙ STEP 3 — BACKEND SETUP

Now we start the server logic.

------------------------------------------------------------

## 🔹 3.1 Open the Project in VS Code

1. Open VS Code
2. Click File → Open Folder
3. Select the Ordering-and-POS-System folder

------------------------------------------------------------

## 🔹 3.2 Open Terminal

In VS Code:

Click Terminal → New Terminal

------------------------------------------------------------

## 🔹 3.3 Go to Backend Folder

Type this in terminal and press Enter:

cd backend

------------------------------------------------------------

## 🔹 3.4 Install Backend Dependencies

Type:

composer install

Wait until it finishes.

------------------------------------------------------------

## 🔹 3.5 Create the .env File

1. Inside backend folder
2. Create a new file named exactly:

.env

3. Open the .env file from Google Drive
4. Copy EVERYTHING
5. Paste it inside the new backend/.env file

Save the file.

IMPORTANT:
Inside the .env file you downloaded, you will see this line:

APP_KEY=base64:[PUT KEY HERE]

DO NOT manually edit this.

In the next step (php artisan key:generate), Laravel will automatically generate and fill this key for you.

Leave it as-is for now.

------------------------------------------------------------

## 🔹 3.6 Generate Application Key

In terminal (still inside backend folder), run:

php artisan key:generate

This will automatically replace:

APP_KEY=base64:[PUT KEY HERE]

with a real generated key.

If it says "Application key set successfully", you're good ✅

------------------------------------------------------------

## 🔹 3.7 Clear Cache

Run:

php artisan config:clear
php artisan cache:clear

------------------------------------------------------------

## 🔹 3.8 Start Backend Server

Run:

php artisan serve

You should see something like:

Server running on http://127.0.0.1:8000

Leave this terminal OPEN.

------------------------------------------------------------

# 💻 STEP 4 — FRONTEND SETUP

Open a NEW terminal in VS Code.

------------------------------------------------------------

## 🔹 4.1 Go to Frontend Folder

cd frontend

------------------------------------------------------------

## 🔹 4.2 Install Frontend Dependencies

npm install

Wait until it finishes.

------------------------------------------------------------

## 🔹 4.3 Start Frontend

npm run dev

You should see:

http://localhost:5173

Click that link or copy it into your browser.

------------------------------------------------------------

# 🧪 HOW TO RUN THE SYSTEM (Quick Version)

Every time you test, do this:

1. Start MySQL
2. In backend folder → run: php artisan serve
3. In frontend folder → run: npm run dev
4. Open: http://localhost:5173

------------------------------------------------------------

# 🛑 IF SOMETHING BREAKS

❌ "No application encryption key"

Run:

php artisan key:generate

If it still fails:
• Make sure your .env file exists inside the backend folder
• Make sure the APP_KEY line is present
• Then run the command again


❌ Database error

Check that MySQL is running.


❌ Port already in use

Close old terminals and try again.

------------------------------------------------------------

# 🎉 YOU ARE DONE

If everything is correct, you should see the website running locally.

If anything fails, send a screenshot of the error.

Do NOT panic 😊
