const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🚀 Rescue Bite Setup Script');
console.log('==========================\n');

async function setup() {
  try {
    // Step 1: Check if .env exists
    if (!fs.existsSync('.env')) {
      console.log('📝 Creating .env file...');
      fs.copyFileSync('.env.example', '.env');
      console.log('✅ .env file created from template');
    } else {
      console.log('✅ .env file already exists');
    }

    // Step 2: Check if node_modules exists
    if (!fs.existsSync('node_modules')) {
      console.log('\n📦 Installing dependencies...');
      await runCommand('npm install');
      console.log('✅ Dependencies installed');
    } else {
      console.log('✅ Dependencies already installed');
    }

    // Step 3: Check MongoDB connection
    console.log('\n🗄️  Testing MongoDB connection...');
    await testMongoConnection();

    // Step 4: Create directories if needed
    const dirs = ['logs', 'uploads'];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        console.log(`✅ Created ${dir} directory`);
      }
    });

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Update .env file with your MongoDB connection string');
    console.log('2. Run: node server.js');
    console.log('3. Open: index.html in your browser');
    console.log('\n📚 For detailed setup guide, see MONGODB_SETUP.md');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Command failed: ${command}\n${stderr}`));
      } else {
        resolve(stdout);
      }
    });
  });
}

async function testMongoConnection() {
  try {
    const mongoose = require('mongoose');
    const dotenv = require('dotenv');
    dotenv.config();

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rescuebite', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });

    console.log('✅ MongoDB connection successful');
    await mongoose.connection.close();
  } catch (error) {
    console.log('⚠️  MongoDB connection failed');
    console.log('💡 Please ensure MongoDB is running or update MONGODB_URI in .env');
    console.log('📖 See MONGODB_SETUP.md for detailed instructions');
  }
}

// Run setup
setup();
