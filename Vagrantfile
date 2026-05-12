# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "bento/ubuntu-22.04"
  config.vm.boot_timeout = 600  # 10 minutes — increase if on a slow machine

  # ─────────────────────────────────────────────
  # VM 1: Database (MySQL)
  # IP: 192.168.56.10
  # ─────────────────────────────────────────────
  config.vm.define "db" do |db|
    db.vm.hostname = "letterboxd-db"
    db.vm.network "private_network", ip: "192.168.56.10"
    db.vm.provider "virtualbox" do |vb|
      vb.name   = "letterboxd-db"
      vb.memory = "512"
      vb.cpus   = 1
      vb.gui    = false
      vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
      vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
    end
    db.vm.provision "shell", path: "provision-db.sh"
  end

  # ─────────────────────────────────────────────
  # VM 2: Backend (Node.js + Express)
  # IP: 192.168.56.11
  # ─────────────────────────────────────────────
  config.vm.define "backend" do |backend|
    backend.vm.hostname = "letterboxd-backend"
    backend.vm.network "private_network", ip: "192.168.56.11"
    backend.vm.provider "virtualbox" do |vb|
      vb.name   = "letterboxd-backend"
      vb.memory = "768"
      vb.cpus   = 1
      vb.gui    = false
      vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
      vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
    end
    backend.vm.synced_folder "./backend", "/app/backend"
    backend.vm.provision "shell", path: "provision-backend.sh"
  end

  # ─────────────────────────────────────────────
  # VM 3: Frontend (React + Vite)
  # IP: 192.168.56.12  →  open http://192.168.56.12 in browser
  # ─────────────────────────────────────────────
  config.vm.define "frontend" do |frontend|
    frontend.vm.hostname = "letterboxd-frontend"
    frontend.vm.network "private_network", ip: "192.168.56.12"
    frontend.vm.network "forwarded_port", guest: 80, host: 8080
    frontend.vm.provider "virtualbox" do |vb|
      vb.name   = "letterboxd-frontend"
      vb.memory = "1024"
      vb.cpus   = 1
      vb.gui    = false
      vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
      vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
    end
    frontend.vm.synced_folder "./frontend", "/app/frontend"
    frontend.vm.provision "shell", path: "provision-frontend.sh"
  end
end

