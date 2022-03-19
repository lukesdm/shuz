# Create a summary document of third-party dependencies' licenses. Exclude private packages excludes ours. 
npx license-checker --production --excludePrivatePackages --out ./licenses-plain.txt
