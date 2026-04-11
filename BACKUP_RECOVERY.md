# Backup and Recovery Procedures

## Database Backup

### MongoDB Atlas (Cloud)
MongoDB Atlas provides automated backups with the free tier:
- **Daily backups** retained for 7 days
- **Point-in-time recovery** for the last 7 days
- **Download backups** manually via Atlas UI

#### Manual Backup via Atlas UI:
1. Go to MongoDB Atlas dashboard
2. Select your cluster
3. Click "Backups" tab
4. Click "Restore" for manual restore
5. Choose restore point and download

### Local MongoDB

#### Create Backup Script
```bash
# Create backup script: backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/rescuebite"
mkdir -p $BACKUP_DIR

mongodump --db rescuebite --out $BACKUP_DIR/backup_$DATE
echo "Backup created: $BACKUP_DIR/backup_$DATE"

# Keep only last 7 days of backups
find $BACKUP_DIR -type d -name "backup_*" -mtime +7 -exec rm -rf {} \;
```

#### Schedule Automatic Backups
```bash
# Add to crontab (Linux/Mac)
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * /path/to/backup.sh

# Windows Task Scheduler equivalent:
# Create task to run backup.bat daily at 2 AM
```

#### Restore from Backup
```bash
# Restore database
mongorestore --db rescuebite /path/to/backup/backup_20241201_020000/rescuebite
```

## Application Backup

### Code Repository Backup
```bash
# Git backup (recommended)
git add .
git commit -m "Backup before deployment"
git push origin main

# Manual backup
tar -czf rescuebite_backup_$(date +%Y%m%d).tar.gz --exclude=node_modules --exclude=logs .
```

### Environment Variables Backup
```bash
# Backup .env file
cp .env .env.backup.$(date +%Y%m%d)

# List all environment variables
printenv > env_backup_$(date +%Y%m%d).txt
```

## Recovery Procedures

### Scenario 1: Database Corruption
```bash
# 1. Stop application
pkill -f "node server.js"

# 2. Restore from latest backup
mongorestore --db rescuebite --drop /path/to/latest/backup/rescuebite

# 3. Restart application
node server.js

# 4. Verify data integrity
node test-basic.js
```

### Scenario 2: Server Crash
```bash
# 1. Check system status
systemctl status rescuebite

# 2. Check logs
tail -f logs/combined.log

# 3. Restart services
systemctl restart rescuebite

# 4. Verify health
curl http://localhost:5000/api/health
```

### Scenario 3: Data Loss
```bash
# 1. Identify point of loss
grep "ERROR" logs/combined.log | tail -20

# 2. Restore from appropriate backup
mongorestore --db rescuebite --drop /path/to/backup_before_incident/rescuebite

# 3. Reconcile lost data
# Check audit logs and manual records
```

## Disaster Recovery Plan

### Level 1: Minor Issues (Minutes)
- **Service restart**: Automatic with PM2
- **Cache clear**: Redis flush if needed
- **Log rotation**: Automatic with logrotate

### Level 2: Major Issues (Hours)
- **Database restore**: From latest backup
- **Code rollback**: Git revert to previous commit
- **Environment restore**: From .env.backup

### Level 3: Complete Failure (Days)
- **Full system rebuild**: From scratch
- **Data import**: From oldest available backup
- **Service migration**: To new server/host

## Monitoring and Alerts

### Health Checks
```bash
# Create health check script: health-check.sh
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)

if [ $response != "200" ]; then
    echo "Health check failed with status $response"
    # Send alert (email, Slack, etc.)
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"Rescue Bite health check failed!"}' \
        YOUR_SLACK_WEBHOOK_URL
fi
```

### Automated Monitoring
```bash
# Add to crontab for every 5 minutes
*/5 * * * * /path/to/health-check.sh
```

### Log Monitoring
```bash
# Monitor error logs
tail -f logs/error.log | grep "ERROR"

# Set up log rotation
sudo nano /etc/logrotate.d/rescuebite
```

## Security Considerations

### Backup Encryption
```bash
# Encrypt backups with GPG
gpg --symmetric --cipher-algo AES256 backup_20241201.tar.gz

# Decrypt when needed
gpg --decrypt backup_20241201.tar.gz.gpg > backup_20241201.tar.gz
```

### Access Control
```bash
# Restrict backup directory permissions
chmod 700 /backups/rescuebite
chown rescuebite:rescuebite /backups/rescuebite

# Secure .env file
chmod 600 .env
```

### Backup Verification
```bash
# Verify backup integrity
mongorestore --db rescuebite_test --dryRun /path/to/backup/rescuebite

# Check backup size
du -sh /backups/rescuebite/backup_*
```

## Recovery Testing

### Monthly Recovery Drill
```bash
# 1. Create test environment
docker run -d -p 27018:27017 mongo:latest

# 2. Restore backup to test
mongorestore --host localhost:27018 --db rescuebite_test /path/to/backup/rescuebite

# 3. Run tests against test database
MONGODB_URI="mongodb://localhost:27018/rescuebite_test" node test-api.js

# 4. Clean up test environment
docker stop $(docker ps -q)
```

## Documentation Updates

### After Recovery
- Document the incident
- Update procedures if needed
- Review and improve monitoring
- Train team on new procedures

### Regular Maintenance
- Quarterly backup verification
- Annual disaster recovery drill
- Update contact information
- Review and update procedures

## Contact Information

### Emergency Contacts
- **Primary Admin**: admin@example.com
- **Database Admin**: dba@example.com
- **System Admin**: sysadmin@example.com

### Service Providers
- **MongoDB Atlas**: https://cloud.mongodb.com/support
- **Railway**: https://railway.app/support
- **Netlify**: https://www.netlify.com/support

---

**Regular testing of backup and recovery procedures is essential for ensuring business continuity.**
