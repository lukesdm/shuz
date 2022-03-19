# shuz
Easy close-quarters messaging.

## Prerequisites
* Node v14+
* Redis (any version)

## Development

```
# Pull and start Redis dev Docker container
./dev-redis/dev-start.sh

# Start app dev server
yarn dev
```

## Deployment
shuz.app is geared towards [Vercel](https://vercel.com/) and [Upstash](https://upstash.com/).

The following environment variables are required:

| Variable | Description | Example
| --- | --- | --- |
| REDIS_URL | URL of Redis instance | redis://localhost:6379 | 

## Special Thanks

To @maxaragon and Zhibek S, for their testing and ideas 🙏.
