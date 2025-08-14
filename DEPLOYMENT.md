# Medflect AI Deployment Guide

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm 8+**
- **Docker** and **Docker Compose** (for containerized deployment)
- **Groq API Key** (for AI features)
- **Ethereum Wallet** (for blockchain features)
- **Domain Name** (for production)

### 1. Local Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd medflect-mvp

# Install dependencies
npm run install-all

# Copy environment configuration
cp env.example .env

# Edit environment variables
nano .env

# Start development servers
npm run dev
```

### 2. Environment Configuration

Edit `.env` file with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=./data/medflect.db

# Groq AI
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=groq/deepseek-r1-distill-llama-70b

# Blockchain
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/your_key
CONTRACT_ADDRESS=your_deployed_contract_address
PRIVATE_KEY=your_private_key_here

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Hospital Configuration
HOSPITAL_ID=37_military_hospital
HOSPITAL_NAME=37 Military Hospital
HOSPITAL_LOCATION=Accra, Ghana
```

## 🐳 Docker Deployment

### Single Server Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f medflect-app

# Stop services
docker-compose down
```

### Production Deployment

1. **Set up SSL certificates**:
```bash
mkdir -p nginx/ssl
# Copy your SSL certificates to nginx/ssl/
```

2. **Configure environment variables**:
```bash
# Create production environment file
cp env.example .env.production
# Edit with production values
```

3. **Deploy with production configuration**:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## ☁️ Cloud Deployment

### AWS Deployment

#### Using AWS ECS

1. **Create ECS Cluster**:
```bash
aws ecs create-cluster --cluster-name medflect-cluster
```

2. **Create ECR Repository**:
```bash
aws ecr create-repository --repository-name medflect-ai
```

3. **Build and Push Image**:
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and tag image
docker build -t medflect-ai .
docker tag medflect-ai:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/medflect-ai:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/medflect-ai:latest
```

4. **Create Task Definition**:
```json
{
  "family": "medflect-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "medflect-app",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/medflect-ai:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "GROQ_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:medflect/groq-api-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/medflect",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Using AWS EC2

1. **Launch EC2 Instance**:
```bash
# Launch Ubuntu 22.04 instance
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --count 1 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxxxxx
```

2. **Install Docker**:
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@<instance-ip>

# Install Docker
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker ubuntu
```

3. **Deploy Application**:
```bash
# Clone repository
git clone <repository-url>
cd medflect-mvp

# Configure environment
cp env.example .env
nano .env

# Start application
docker-compose up -d
```

### Google Cloud Platform Deployment

#### Using Google Cloud Run

1. **Enable APIs**:
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

2. **Build and Deploy**:
```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/<project-id>/medflect-ai

# Deploy to Cloud Run
gcloud run deploy medflect-ai \
  --image gcr.io/<project-id>/medflect-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

### Azure Deployment

#### Using Azure Container Instances

1. **Create Resource Group**:
```bash
az group create --name medflect-rg --location eastus
```

2. **Deploy Container**:
```bash
az container create \
  --resource-group medflect-rg \
  --name medflect-app \
  --image medflect-ai:latest \
  --dns-name-label medflect-app \
  --ports 3001 \
  --environment-variables NODE_ENV=production
```

## 🔧 Configuration Management

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `development` |
| `PORT` | Server port | No | `3001` |
| `GROQ_API_KEY` | Groq AI API key | Yes | - |
| `ETHEREUM_RPC_URL` | Ethereum RPC endpoint | No | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `HOSPITAL_ID` | Hospital identifier | Yes | - |

### Database Configuration

#### SQLite (Default)
```env
DATABASE_URL=./data/medflect.db
```

#### PostgreSQL
```env
DATABASE_URL=postgresql://user:password@localhost:5432/medflect
```

#### MySQL
```env
DATABASE_URL=mysql://user:password@localhost:3306/medflect
```

### SSL Configuration

1. **Generate SSL Certificate**:
```bash
# Using Let's Encrypt
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/
```

2. **Configure Nginx**:
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    location / {
        proxy_pass http://medflect-app:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 Monitoring and Logging

### Application Monitoring

1. **Health Checks**:
```bash
# Check application health
curl http://localhost:3001/health

# Check Docker container health
docker ps
```

2. **Log Monitoring**:
```bash
# View application logs
docker-compose logs -f medflect-app

# View nginx logs
docker-compose logs -f nginx
```

3. **Metrics Dashboard**:
- **Grafana**: http://localhost:3000 (admin/admin123)
- **Prometheus**: http://localhost:9090

### Backup Strategy

1. **Automated Backups**:
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U medflect medflect > backup_$DATE.sql
tar -czf backup_$DATE.tar.gz backup_$DATE.sql
aws s3 cp backup_$DATE.tar.gz s3://your-backup-bucket/
rm backup_$DATE.sql backup_$DATE.tar.gz
EOF

chmod +x backup.sh

# Add to crontab
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

2. **Database Backup**:
```bash
# Manual backup
docker-compose exec postgres pg_dump -U medflect medflect > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U medflect medflect < backup.sql
```

## 🔒 Security Configuration

### Firewall Setup

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# iptables (CentOS/RHEL)
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo service iptables save
```

### SSL/TLS Configuration

```nginx
# Strong SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

### Rate Limiting

```nginx
# Rate limiting configuration
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://medflect-app:3001;
}

location /api/auth/login {
    limit_req zone=login burst=5 nodelay;
    proxy_pass http://medflect-app:3001;
}
```

## 🚀 Performance Optimization

### Caching Strategy

1. **Redis Caching**:
```javascript
// Configure Redis for session storage
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});
```

2. **CDN Configuration**:
```nginx
# Static asset caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_patients_mrn ON patients(mrn);
CREATE INDEX idx_encounters_patient_id ON encounters(patient_id);
CREATE INDEX idx_vital_signs_patient_id ON vital_signs(patient_id);
CREATE INDEX idx_medications_patient_id ON medications(patient_id);
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: medflect-ai
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster medflect-cluster --service medflect-service --force-new-deployment
```

## 🆘 Troubleshooting

### Common Issues

1. **Port Already in Use**:
```bash
# Find process using port
sudo lsof -i :3001

# Kill process
sudo kill -9 <PID>
```

2. **Database Connection Issues**:
```bash
# Check database status
docker-compose exec postgres pg_isready -U medflect

# Reset database
docker-compose down -v
docker-compose up -d
```

3. **Memory Issues**:
```bash
# Check memory usage
docker stats

# Increase memory limits
docker-compose down
docker-compose up -d --scale medflect-app=2
```

### Log Analysis

```bash
# View error logs
docker-compose logs medflect-app | grep ERROR

# Monitor real-time logs
docker-compose logs -f --tail=100 medflect-app

# Export logs
docker-compose logs medflect-app > app.log
```

## 📞 Support

For deployment support:

- **Documentation**: [docs.medflect.ai](https://docs.medflect.ai)
- **Community**: [community.medflect.ai](https://community.medflect.ai)
- **Email**: support@medflect.ai
- **GitHub Issues**: [github.com/medflect/medflect-ai/issues](https://github.com/medflect/medflect-ai/issues)

---

**Medflect AI** - Transforming healthcare in Ghana and beyond 🇬🇭 