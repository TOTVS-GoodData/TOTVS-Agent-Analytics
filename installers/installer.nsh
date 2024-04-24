Function un.atomicRMDir2
  Exch $R0
  Push $R1
  Push $R2
  Push $R3
  StrCpy $R3 "$INSTDIR$R0\*.*"
  FindFirst $R1 $R2 $R3
  
  loop:
    StrCmp $R2 "" break
    StrCmp $R2 "." continue
    StrCmp $R2 ".." continue
    
    IfFileExists "$INSTDIR$R0\$R2\*.*" isDir isNotDir
    
  isDir:
    StrCmp $R2 "assets" continue checkLog
  checkLog:
    StrCmp $R2 "logs" continue removeDir
  
  removeDir:
    CreateDirectory "$PLUGINSDIR\old-install$R0\$R2"
    
    Push "$R0\$R2"
    Call un.atomicRMDir2
    RMDir /r "$INSTDIR$R0\$R2"
    Pop $R3
    
    StrCmp $R3 "0" continue
    Goto done
    
  isNotDir:
    ClearErrors
    Rename "$INSTDIR$R0\$R2" "$PLUGINSDIR\old-install$R0\$R2"
    
    # Ignore errors when renaming ourselves.
    #StrCmp "$R0\$R2" "${UNINSTALL_FILENAME}" 0 +2
    ClearErrors
    
    IfErrors 0 +3
    StrCpy $R3 "$INSTDIR$R0\$R2"
    Goto done
    
  continue:
    FindNext $R1 $R2
    Goto loop
    
  break:
    StrCpy $R3 0
    
  done:
    FindClose $R1
    StrCpy $R0 $R3
    Pop $R3
    Pop $R2
    Pop $R1
    Exch $R0
FunctionEnd

!macro customRemoveFiles
  ; Condicional para apagar as pastas logs/assets apenas no processo de atualização (E não na desinstalação)
  ;${if} ${isUpdated}
    CreateDirectory "$PLUGINSDIR\old-install"
    Push ""
    Call un.atomicRMDir2
    Pop $R0
    ${if} $R0 != 0
      DetailPrint "File is busy, aborting: $R0"
      # Attempt to restore previous directory
      Push ""
      Call un.restoreFiles
      Pop $R0
      Abort `Can't rename "$INSTDIR" to "$PLUGINSDIR\old-install".`
    ${endif}
  ;${else}
  ;  # Remove all files (or remaining shallow directories from the block above)
  ;  RMDir /r $INSTDIR
  ;${endif}
!macroend

!macro preInit
  ClearErrors
  SetRegView 64
  ReadRegStr $R0 HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "TOTVS Agent Analytics"
  ReadRegStr $R1 HKLM "Software\TOTVS Agent Analytics" "autoUpdate"

  ; Verifica se o Agent já está instalado
  StrCmp $R0 "" NotInstalled +1
  
  ; Verifica se o comando de instalação foi disparado pelo autoUpdate do Electron
  StrCmp $R1 "1" AutoUpdate +1
  
  MessageBox MB_OK|MB_ICONEXCLAMATION "TOTVS Agent Analytics já está instalado. Por favor, desinstale a versão atual antes de executar este instalador novamente."
  Abort
  
  NotInstalled:
  AutoUpdate:
  
!macroend

!macro customUnInstall
  ClearErrors
  SetRegView 64
  DeleteRegValue HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "TOTVS Agent Analytics"
  DeleteRegKey HKLM "Software\TOTVS Agent Analytics"
!macroend
