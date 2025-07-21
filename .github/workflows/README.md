# Deployment Setup

This directory contains GitHub Actions workflows for automated deployment.

## AWS S3 + CloudFront Deployment

The `deploy.yml` workflow automatically builds and deploys the React app to AWS S3 and invalidates CloudFront cache.

### Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

#### AWS Credentials
- `AWS_ACCESS_KEY_ID` - AWS access key with S3 and CloudFront permissions
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key
- `AWS_REGION` - AWS region (e.g., `us-east-1`)

#### AWS Resources
- `S3_BUCKET_NAME` - S3 bucket name for hosting the static site
- `CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution ID

#### Application Secrets
- `REACT_APP_GOOGLE_MAPS_API_KEY` - Google Maps API key (optional)

### AWS Setup Required

1. **S3 Bucket**: Create and configure for static website hosting
2. **CloudFront Distribution**: Create distribution pointing to S3 bucket
3. **IAM User**: Create with appropriate permissions

### Trigger Conditions

The workflow runs on:
- Push to `main` branch
- Pull requests to `main` branch  
- Manual trigger via GitHub Actions UI

### Deployment Features

- **Optimized Caching**: Static assets cached for 1 year, HTML files for immediate revalidation
- **Clean Deployments**: Removes old files with `--delete` flag
- **Cache Invalidation**: Automatically invalidates CloudFront cache
- **Build Optimization**: Production build with environment variables