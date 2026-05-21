#!/bin/bash

echo "==Informations système=="

laDate=$(date +"%T")
echo "Il est présentement : $laDate"

Nom=$(hostname)
echo "Bienvenue à $Nom"

echo "Espace disque disponible :"
df -h
echo

echo "Les utilisateurs locaux (dans /home) sont: "
ls -d /home/*/  #ou ls /home
echo


echo "Vérifions si ssh est actif"
systemctl list-units --type=service | grep ssh    #ou systemctl is-active ssh
echo

echo "Affiche le statut ssh"
systemctl status ssh
echo

echo "Voici les 5 dernières lignes du journal système"
journalctl -n 5 --no-pager -q                         #ou sudo tail -n 5 /var/log/syslog (mais demandera mdp) 
echo

echo "Les connexions réseau actives en ce moment sont : "
ip a
echo

echo "==Fin de l'audit=="
