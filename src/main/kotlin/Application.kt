package net.raphdf201

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.netty.EngineMain
import io.ktor.server.response.respond
import io.ktor.server.routing.RoutingCall
import io.ktor.server.sessions.get
import io.ktor.server.sessions.sessions
import java.io.File
import kotlin.concurrent.withLock
import kotlin.time.Clock
import kotlin.time.ExperimentalTime

fun main(args: Array<String>) {
    EngineMain.main(args)
}

fun Application.module() {
    configureDatabases()
    configureSecurity()
    configureHTTP()
}

/**
 * If a logged-in session is present, return true
 */
fun RoutingCall.isLoggedIn(): Boolean {
    return this.sessions.get<UserSession>()?.isLoggedIn ?: false
}

/**
 * If logged in, execute action and respond successCode
 * Else, respond {@link HttpStatusCode#Unauthorized}
 */
suspend fun RoutingCall.authorizedAction(successCode: HttpStatusCode = HttpStatusCode.OK, action: suspend () -> Unit) {
    if (this.isLoggedIn()) {
        action()
        this.respond(successCode)
    } else this.respond(HttpStatusCode.Unauthorized)
}

/**
 * If logged in, execute action and respond successCode + message
 * Else, respond {@link HttpStatusCode#Unauthorized}
 */
suspend fun RoutingCall.authorizedAction(successCode: HttpStatusCode = HttpStatusCode.OK, message: Any, action: suspend () -> Unit) {
    if (this.isLoggedIn()) {
        action()
        this.respond(successCode, message)
    } else this.respond(HttpStatusCode.Unauthorized)
}

/**
 * If logged in, execute action and respond successCode + message
 * Else, respond {@link HttpStatusCode#Unauthorized}
 */
suspend fun RoutingCall.authorizedActionWithMessage(successCode: HttpStatusCode = HttpStatusCode.OK, action: suspend () -> Any) {
    if (this.isLoggedIn()) {
        this.respond(successCode, action())
    } else this.respond(HttpStatusCode.Unauthorized)
}

/**
 * Append the provided string to the log with automatic rotation at 50MB
 */
@OptIn(ExperimentalTime::class)
fun log(string: String) {
    Constants.logLock.withLock {
        try {
            val logFile = File("${Constants.LOG_PATH}/taskmgr.log")

            // Ensure parent directory exists
            logFile.parentFile?.mkdirs()

            // Append with timestamp
            val timestamp = Clock.System.now()
            val message = if (string.endsWith("\n")) string else "$string\n"
            logFile.appendText("[$timestamp] $message")

            // Check size periodically instead of every call
            Constants.lastSizeCheck++
            if (Constants.lastSizeCheck >= Constants.SIZE_CHECK_INTERVAL && logFile.length() > 50 * 1024 * 1024) {
                rotateLog(logFile)
                Constants.lastSizeCheck = 0
            }
        } catch (e: Exception) {
            // Fallback to stderr if logging fails
            System.err.println("Failed to write to log: ${e.message}")
            System.err.println("Original message: $string")
        }
    }
}

@OptIn(ExperimentalTime::class)
private fun rotateLog(logFile: File) {
    try {
        val timestamp = Clock.System.now().toString().replace(":", "-")
        val rotatedFile = File("${Constants.LOG_PATH}/taskmgr-$timestamp.log")

        // Move instead of copy+delete (atomic operation)
        logFile.renameTo(rotatedFile)

        // If rename fails, fall back to copy+delete
        if (!rotatedFile.exists()) {
            logFile.copyTo(rotatedFile, overwrite = false)
            logFile.delete()
        }
    } catch (e: Exception) {
        System.err.println("Failed to rotate log: ${e.message}")
    }
}
