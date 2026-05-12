**ls /bin**

bin                boot   dev  home  lib64              lost+found  mnt  proc  run   sbin.usr-is-merged  srv  tmp  var
bin.usr-is-merged  cdrom  etc  lib   lib.usr-is-merged  media       opt  root  sbin  snap                sys  usr

> bin contient possiblement les dossiers cachés, lost and found? ou plutôt une sorte de corbeil?? il mentionne aussi que bin ou sbin et usr are merged

**ls /etc**
adduser.conf            credstore            environment.d         host.conf        libblockdev     netplan              profile.d      shadow             ubuntu-advantage
alsa                    credstore.encrypted  ethertypes            hostname         libibverbs.d    network              protocols      shadow-            ucf.conf
alternatives            cron.d               fonts                 hosts            libnl-3         networkd-dispatcher  pulse          shells             udev
anacrontab              cron.daily           fprintd.conf          hosts.allow      libpaper.d      NetworkManager       python3        skel               udisks2
apg.conf                cron.hourly          fstab                 hosts.deny       locale.alias    networks             python3.12     snmp               ufw
apm                     cron.monthly         fuse.conf             hp               locale.conf     newt                 rc0.d          speech-dispatcher  update-manager
apparmor                crontab              fwupd                 ifplugd          locale.gen      nftables.conf        rc1.d          ssh                update-motd.d
apparmor.d              cron.weekly          gai.conf              init             localtime       nsswitch.conf        rc2.d          ssl                update-notifier
apport                  cron.yearly          gdb                   init.d           logcheck        openvpn              rc3.d          sssd               UPower
apt                     cups                 gdm3                  initramfs-tools  login.defs      opt                  rc4.d          subgid             usb_modeswitch.conf
avahi                   cupshelpers          geoclue               inputrc          logrotate.conf  os-release           rc5.d          subgid-            usb_modeswitch.d
bash.bashrc             dbus-1               ghostscript           insserv.conf.d   logrotate.d     PackageKit           rc6.d          subuid             vconsole.conf
bash_completion         dconf                glvnd                 ipp-usb          lsb-release     pam.conf             rcS.d          subuid-            vim
bindresvport.blacklist  debconf.conf         gnome                 iproute2         machine-id      pam.d                resolv.conf    sudo.conf          vtrgb
binfmt.d                debian_version       gnome-remote-desktop  issue            magic           papersize            rmt            sudoers            vulkan
bluetooth               debuginfod           gnutls                issue.net        magic.mime      passwd               rpc            sudoers.d          wgetrc
brlapi.key              default              groff                 kernel           manpath.config  passwd-              rsyslog.conf   sudo_logsrvd.conf  wpa_supplicant
brltty                  deluser.conf         group                 kerneloops.conf  mime.types      pcmcia               rsyslog.d      supercat           X11
brltty.conf             depmod.d             group-                krb5.conf.d      mke2fs.conf     perl                 rygel.conf     sysctl.conf        xattr.conf
ca-certificates         dhcp                 grub.d                ldap             ModemManager    pki                  sane.d         sysctl.d           xdg
ca-certificates.conf    dhcpcd.conf          gshadow               ld.so.cache      modprobe.d      plymouth             security       sysstat            xml
chatscripts             dictionaries-common  gshadow-              ld.so.conf       modules         pm                   selinux        systemd            zsh_command_not_found
cloud                   dpkg                 gss                   ld.so.conf.d     modules-load.d  pnm2ppa.conf         sensors3.conf  terminfo
colord                  e2scrub.conf         gtk-2.0               legal            mtab            polkit-1             sensors.d      thermald
console-setup           emacs                gtk-3.0               libao.conf       nanorc          ppp                  services       timezone
cracklib                environment          hdparm.conf           libaudit.conf    netconfig       profile              sgml           tmpfiles.d

> etc: toutes les fichiers de configurations .conf ?!

**ls /var/log**

alternatives.log  bootstrap.log          cups-browsed  dmesg.2.gz      gdm3             kern.log  speech-dispatcher              unattended-upgrades  vboxpostinstall.log
apport.log        btmp                   dist-upgrade  dmesg.3.gz      gpu-manager.log  lastlog   sssd                           vboxadd-install.log  wtmp
apt               cloud-init.log         dmesg         dpkg.log        hp               openvpn   syslog                         vboxadd-setup.log
auth.log          cloud-init-output.log  dmesg.0       faillog         installer        private   sysstat                        vboxadd-setup.log.1
boot.log          cups                   dmesg.1.gz    fontconfig.log  journal          README    ubuntu-advantage-apt-hook.log  vboxadd-setup.log.2

> var/log : affiche les fichiers.log (logiciels?)

**ls /home**
bou@Linuxnew:~$ ls /home
bou

>affiche le dossier root, ici c'est home et porte le nom du user

ls /usr/bin | head -20
[
aa-enabled
aa-exec
aa-features-abi
aconnect
acpidbg
add-apt-repository
addpart
airscan-discover
alsabat
alsaloop
alsamixer
alsatplg
alsaucm
amidi
amixer
apg
apgbfm
aplay
aplaymidi

>usr: ici n'est pas un dossier user, mais plutôt un espace qui contient tous les programmes, biblio et données partagées du système, accessible à tous les utilisateurs et souvent en mode lecture seulement, et ici possiblement avec le | head -20, on ajoute la commande d'afficher ce dossier usr depuis le head et l'organiser en ligne ??
