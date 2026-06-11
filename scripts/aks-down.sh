#!/usr/bin/env bash
# Delete the whole resource group — stops all AKS billing. Run when done.
set -euo pipefail
RG="${RG:-rg-portfolio}"
echo "==> Deleting resource group '$RG' (cluster, nodes, load balancer, IP)..."
az group delete --name "$RG" --yes --no-wait
echo "==> Deletion started in the background. Verify with: az group list -o table"
