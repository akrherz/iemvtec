#!/bin/bash
# Deployment script
# To send to production `sh deploy.sh  --prod`
# To run locally `sh deploy.sh`

if ! npm run build; then
    echo "Build failed. Exiting."
    exit 1
fi

if [ "$1" == "--prod" ]; then
    echo "Deploying to production..."
    for i in {35..44}; do
        echo "Deploying to IEMVS${i}-DC"
        rsync -av ./dist/* "mesonet@iemvs${i}-dc:/opt/iem/htdocs/vtec/"
    done

else
    echo "Deploying to local development environment..."
    rsync -av ./dist/* /opt/iem/htdocs/vtec/
fi
