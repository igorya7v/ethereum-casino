
# This script reads the address and abi of the deployed by truffle 
# Ethereum Smart Contract (./backend/build/contracts/Casino.json).
# And then injects it into the frontend config file (./frontend/src/js/config.js),
# So it could be used by the Deployed Dapp (React). 

import json

CONTRACT_JSON_FILE = './backend/build/contracts/Casino.json'
JAVASCRIPT_CONFIG_TEMPLATE_FILE = './frontend/src/js/config-template.js'
JAVASCRIPT_CONFIG_FILE = './frontend/src/js/config.js'


print("Reading contract address and ABI from: {}" .format(CONTRACT_JSON_FILE))
with open(CONTRACT_JSON_FILE) as json_file:
    data = json.load(json_file)

print("Contract address: {}" .format(data['networks']['3']['address']))
print("Contract ABI: {}" .format(data['abi']))
print("---")

print("Injecting the config data into: {}" .format(JAVASCRIPT_CONFIG_TEMPLATE_FILE))
with open(JAVASCRIPT_CONFIG_TEMPLATE_FILE, 'r') as f:
    config = f.read()

config = config.replace('<%address_placeholder%>', json.dumps(data['networks']['3']['address']))
config = config.replace('<%abi_placeholder%>', json.dumps(data['abi']))

print("Writing config file: {}" .format(JAVASCRIPT_CONFIG_FILE))
with open(JAVASCRIPT_CONFIG_FILE, "w") as f:
    f.write(config)
    
print("Done")