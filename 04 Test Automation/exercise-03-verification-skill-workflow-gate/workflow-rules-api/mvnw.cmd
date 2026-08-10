@ECHO OFF
SETLOCAL
SET WRAPPER_JAR=%~dp0.mvn\wrapper\maven-wrapper.jar
java -classpath "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%~dp0." org.apache.maven.wrapper.MavenWrapperMain %*
IF ERRORLEVEL 1 EXIT /B %ERRORLEVEL%
ENDLOCAL
