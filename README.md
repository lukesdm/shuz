# shuz
Easy close-quarters messaging.

## Prerequisites
* Node ^14.7.0
* Redis (any version)

## Development

```
# Pull and start Redis Docker container
./scripts/dev-start.sh

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

To [@maxaragon](https://github.com/maxaragon) and [@zhibeksolp](https://github.com/zhibeksolp), for their testing and ideas 🙏.
