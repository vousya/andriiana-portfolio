#!/usr/bin/env bash
# Provision a small AKS cluster, enable managed NGINX ingress, and deploy.
# Prereqs: az login   (and a subscription with quota for ~2 vCPU)
set -euo pipefail

RG="${RG:-rg-portfolio}"
LOCATION="${LOCATION:-westeurope}"
CLUSTER="${CLUSTER:-aks-portfolio}"
NODE_SIZE="${NODE_SIZE:-Standard_B2s}"
NODE_COUNT="${NODE_COUNT:-2}"

echo "==> Resource group: $RG ($LOCATION)"
az group create --name "$RG" --location "$LOCATION" --output none

echo "==> Creating AKS '$CLUSTER' (this takes ~5 min)..."
az aks create \
  --resource-group "$RG" \
  --name "$CLUSTER" \
  --node-count "$NODE_COUNT" \
  --node-vm-size "$NODE_SIZE" \
  --network-plugin azure \
  --generate-ssh-keys \
  --tier free \
  --output none

echo "==> Enabling managed NGINX ingress (app routing add-on)..."
az aks approuting enable --resource-group "$RG" --name "$CLUSTER" --output none

echo "==> Fetching kubeconfig..."
az aks get-credentials --resource-group "$RG" --name "$CLUSTER" --overwrite-existing

echo "==> Deploying manifests..."
kubectl apply -k "$(dirname "$0")/../k8s"
kubectl -n portfolio rollout status deployment/portfolio --timeout=180s

echo "==> Waiting for ingress public IP..."
for i in $(seq 1 30); do
  IP=$(kubectl -n portfolio get ingress portfolio \
        -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || true)
  [ -n "$IP" ] && break
  sleep 10
done

echo
echo "================================================================"
echo "  Live at:  http://${IP:-<pending>}/"
echo "  Pods:     kubectl -n portfolio get pods"
echo "  Tear down (STOP billing):  ./scripts/aks-down.sh"
echo "================================================================"
