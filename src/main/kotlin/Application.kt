package net.raphdf201

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.netty.EngineMain
import io.ktor.server.response.respond
import io.ktor.server.routing.RoutingCall
import io.ktor.server.sessions.get
import io.ktor.server.sessions.sessions

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
