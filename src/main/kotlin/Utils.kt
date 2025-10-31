package net.raphdf201

import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respondText
import io.ktor.server.routing.RoutingCall
import kotlinx.serialization.json.Json

suspend fun <T> RoutingCall.respondJson(msg: T, statusCode: HttpStatusCode = HttpStatusCode.OK) {
    this.respondText(Json.encodeToString(this), ContentType.Application.Json, statusCode)
}
