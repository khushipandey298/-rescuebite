const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Deploy Rescue Bite to Railway');
console.log('=============================\n');

async function deployToRailway() {
  try {
    // Check if Railway CLI is installed
    console.log('1. Checking Railway CLI...');
    try {
      await runCommand('railway --version');
      console.log('   Railway CLI found');
    } catch (error) {
      console.log('   Installing Railway CLI...');
      await runCommand('npm install -g @railway/cli');
    }

    // Check if user is logged in
    console.log('\n2. Checking Railway login...');
    try {
      await runCommand('railway whoami');
      console.log('   Already logged in');
    } catch (error) {
      console.log('   Please login to Railway:');
      await runCommand('railway login');
    }

    // Initialize Railway project
    console.log('\n3. Initializing Railway project...');
    try {
      await runCommand('railway init --name rescuebite-api');
      console.log('   Railway project initialized');
    } catch (error) {
      console.log('   Project may already exist, continuing...');
    }

    // Deploy to Railway
    console.log('\n4. Deploying to Railway...');
    await runCommand('railway up');
    console.log('   Deployment started');

    // Get project URL
    console.log('\n5. Getting deployment URL...');
    const urlOutput = await runCommand('railway domain');
    const backendUrl = urlOutput.trim();

    console.log('\n6. Setting environment variables...');
    await runCommand(`railway variables set NODE_ENV=production`);
    await runCommand(`railway variables set PORT=5000`);

    // Update frontend with backend URL
    console.log('\n7. Updating frontend configuration...');
    await updateFrontendConfig(backendUrl);

    console.log('\n8. Creating frontend deployment...');
    await createFrontendDeployment(backendUrl);

    console.log('\n' + '='.repeat(50));
    console.log('Deployment Complete!');
    console.log('='.repeat(50));
    console.log(`Backend URL: ${backendUrl}`);
    console.log(`Frontend will be deployed to Netlify`);
    console.log('\nNext Steps:');
    console.log('1. Set up MongoDB Atlas connection');
    console.log('2. Update Railway environment variables');
    console.log('3. Deploy frontend to Netlify');
    console.log('\nSee DEPLOYMENT.md for detailed instructions');

  } catch (error) {
    console.error('Deployment failed:', error.message);
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

async function updateFrontendConfig(backendUrl) {
  const indexPath = path.join(__dirname, 'index.html');
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Update API base URL
  content = content.replace(
    "const API_BASE = 'http://localhost:5000/api';",
    `const API_BASE = '${backendUrl}/api';`
  );
  
  fs.writeFileSync(indexPath, content);
  console.log('   Frontend API URL updated');
}

async function createFrontendDeployment(backendUrl) {
  // Create netlify.toml for frontend
  const netlifyConfig = `
[build]
  publish = "."
  command = "echo 'No build needed'"

[build.environment]
  NODE_ENV = "production"

[[redirects]]
  from = "/api/*"
  to = "${backendUrl}/api/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
`;

  fs.writeFileSync(path.join(__dirname, 'netlify.toml'), netlifyConfig);
  console.log('   Netlify configuration created');
  
  // Create manifest.json for PWA
  const manifest = {
    name: "Rescue Bite - Jamshedpur Food Rescue",
    short_name: "Rescue Bite",
    description: "Connect food donors with NGOs in Jamshedpur",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#6366f1",
    icons: [
      {
        src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='50%' text-anchor='middle' dominant-baseline='middle' font-size='50'>Rescue Bite</text></svg>",
        sizes: "192x192",
        type: "image/svg+xml"
      }
    ]
  };

  fs.writeFileSync(path.join(__dirname, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('   PWA manifest created');
}

// Run deployment
deployToRailway();
