package net.raphdf201

import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respondText
import io.ktor.server.routing.RoutingCall
import kotlinx.serialization.json.Json

suspend inline fun <reified T> RoutingCall.respondJson(msg: T, statusCode: HttpStatusCode = HttpStatusCode.OK) {
    this.respondText(Json.encodeToString(msg), ContentType.Application.Json, statusCode)
}
