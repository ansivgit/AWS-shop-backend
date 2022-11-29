#!
aws dynamodb batch-write-item --request-items file://db_products.json
aws dynamodb batch-write-item --request-items file://db_stocks.json
