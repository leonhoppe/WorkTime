echo "Creating Version v$1"

# Build program
docker build -t ghcr.io/leonhoppe/worktime:latest -t ghcr.io/leonhoppe/worktime:$1 .

# Deploy latest version
docker push ghcr.io/leonhoppe/worktime:latest

# Deploy specified version
docker push ghcr.io/leonhoppe/worktime:$1
