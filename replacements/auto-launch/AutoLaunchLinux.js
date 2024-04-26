var fileBasedUtilities, untildify;

untildify = require('untildify');

fileBasedUtilities = require('./fileBasedUtilities');

module.exports = {

  /* Public */
  enable: function(arg) {
    var appName, appPath, dataStartup, dataDesktop, hiddenArg, isHiddenOnLaunch;
    appName = arg.appName, appPath = arg.appPath, isHiddenOnLaunch = arg.isHiddenOnLaunch;
    hiddenArg = isHiddenOnLaunch ? ' --hidden' : '';
    iconPath = arg.appPath.substring(0, arg.appPath.length - arg.appName.length) + 'icons/linux/analytics.png';
    dataStartup = "[Desktop Entry]" + 
            "\nType=Application" +
            "\nVersion=1.0" +
            "\nName=" + appName + 
            "\nComment=" + appName + " startup script" +
            "\nExec=\"" + appPath + "\"" + hiddenArg + 
            "\nIcon=" + iconPath + 
            "\nStartupNotify=false" +
            "\nTerminal=false";
    dataDesktop = "[Desktop Entry]" + 
            "\nType=Application" +
            "\nVersion=1.0" +
            "\nName=" + appName + 
            "\nComment=" + appName + " startup script" +
            "\nExec=\"" + appPath + "\"" +
            "\nIcon=" + iconPath + 
            "\nStartupNotify=false" +
            "\nTerminal=false";
    createFileOnStartup = fileBasedUtilities.createFile({
      data: dataStartup,
      directory: this.getDirectory(),
      filePath: "" + this.getDirectoryFilepath(appName)
    });
    
    createFileOnDesktop = fileBasedUtilities.createFile({
      data: dataDesktop,
      directory: this.getDesktop(),
      filePath: "" + this.getDesktopFilepath(appName)
    });
    
    return (createFileOnStartup && createFileOnDesktop);
  },
  disable: function(appName) {
    var a, b;
    a = fileBasedUtilities.removeFile(this.getDirectoryFilepath(appName));
    b = fileBasedUtilities.removeFile(this.getDesktopFilepath(appName));
    return (a && b);
  },
  isEnabled: function(appName) {
    return fileBasedUtilities.isEnabled(this.getDirectoryFilepath());
  },

  /* Private */
  getDirectory: function() {
    return untildify('~/.config/autostart/');
  },
  getDesktop: function() {
    return untildify('~/Desktop/');
  },
  getDirectoryFilepath: function(appName) {
    return this.getDirectory() + appName + ".desktop";
  },
  getDesktopFilepath: function(appName) {
    return this.getDesktop() + appName + ".desktop";
  },
};
