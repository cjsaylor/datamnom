# encoding: utf-8

# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

    config.vm.box = "trusty64"
    config.vm.box_url = "http://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-amd64-vagrant-disk1.box"
    config.vm.network :private_network, ip: "33.33.0.75"
    config.vm.hostname = "datamnom.dev"
    config.ssh.forward_agent = true
    config.omnibus.chef_version = :latest

    config.vm.provider :virtualbox do |vb|
        vb.name = "Datamnom"
        vb.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/graph", "1"]
        vb.customize ["modifyvm", :id, "--memory", 2048]
    end

    # Workaround for a bug in sync folder caching in vagrant 1.7.2
    config.trigger.before [:reload, :up], stdout: true do
        SYNCED_FOLDER = ".vagrant/machines/default/virtualbox/synced_folders"
        info "Deleting cached synced folder reference."
        begin
            File.delete(SYNCED_FOLDER)
        rescue Exception => ex
            warn "Could not delete folder #{SYNCED_FOLDER}."
            warn ex.message
        end
    end

    config.vm.provision :chef_solo do |chef|
    chef.cookbooks_path = ["cookbooks"]
    chef.add_recipe :apt
    chef.add_recipe 'nodejs'
    chef.add_recipe 'java'
    chef.add_recipe 'vim'
    chef.add_recipe 'elasticsearch'
    chef.add_recipe 'simple-kibana'
    chef.json = {
        "java" => {
            "install_flavor" => "openjdk",
            "jdk_version" => "7"
        },
        "elasticsearch" => {
            "cluster" => {
                "name" => "elasticsearch_datamnom"
            },
            "version" => "1.4.4"
        }
    }
    end
end
