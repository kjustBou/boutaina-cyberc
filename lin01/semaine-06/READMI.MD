##Livrable final Linux  

#Documentation de la création du script audit-system.sh  
-ce script doit se lancer et nous donner un rapport général sur le système en cours 

d'abord, on commence par dater cet audit, en créant des variables pour la date et la machine en question    

puis on procède avec différentes commandes qui vont aller chercher différentes infos:  

-on identifie les utilisateurs du dossier home  
>au début j'ai utilisé **ls /home" mais ça m'afficher deux utilisateurs kbou et un autre fichier .log, mais pour filtrer et ne garder que les dossiers j'ai utilisé **ls -d /home/*/**  
---
-vérification du service ssh  
> en 2 commandes **systemctl list-units --type=service | grep ssh** ou version plus simple **systemctl is-active ssh**  
comme résultat ça confirme l'activation du système  
puis avec **systemctl status ssh** on a le statut complet affiché  
---
-On veut afficher les 5 dernières lignes du log système (/var/log/syslog)     
>avec la commande régulière de **sudo tail -n 5 /var/log/syslog** le système nous demande le mdp, alors pour empêcher d'arrêter le script à cette étape là, j'ai plutôt utilisé la commande **journalctl -n 5 --no-pager -q** en ajoutant plus tard le -q pour retirer "les hints" que le système affichait,  
donc ça a affiché les 5 dernières lignes logs de mon utilisateur  
autre option selon les recherches serait d'utiliser **sudo usermod -aG adm kbou** pour rendre mon utilisateur comme admin, puis redémarrer le système  
---
-vérification de la configuration réseau (les connexions réseau actives)  
> j'utilise **ip a**  
  
