# Uptime Monitoring Setup for QNOVA VR

## Free Monitoring Services:
1. **UptimeRobot** (https://uptimerobot.com)
   - Monitor: https://qnova-vr.com
   - Monitor: https://api.qnova-vr.com/health
   - Check interval: 5 minutes
   - Email alerts to: qnovavr.de@gmail.com
   - SMS alerts: +49 160 96286290

2. **Pingdom** (https://pingdom.com)
   - Free plan: 1 check every 1 minute
   - Multiple alert channels
   - Performance insights

3. **StatusCake** (https://statuscake.com)
   - Website monitoring
   - Page speed monitoring
   - SSL certificate monitoring

## Health Check Endpoints:
- Website: https://qnova-vr.com/health
- Backend API: https://api.qnova-vr.com/health
- Database: Internal health check in backend

## Alert Configuration:
- Email: Immediate alerts for downtime
- SMS: Critical alerts only
- Webhook: Integrate with Slack/Discord for team notifications

## SLA Target: 99.9% uptime (8.77 hours downtime per year)