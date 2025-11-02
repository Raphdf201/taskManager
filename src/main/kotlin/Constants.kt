package net.raphdf201

const val DBURL = "jdbc:mariadb://raw.raphdf201.net:3306/taskmanager"
const val DBUSER = "taskmgr"
const val DBDRIVER = "org.mariadb.jdbc.Driver"
const val DBPW = "TaskManagerPw124!"

const val AUTHCALLBACK = "https://commtasks.raphdf201.net/callback"
const val AUTHNAME = "google"
const val AUTHAUTHORIZEURL = "https://accounts.google.com/o/oauth2/auth"
const val AUTHACCESSTOKENURL = "https://accounts.google.com/o/oauth2/token"
const val AUTHCLIENTID = "963962680553-ju8joh4ct4qeevmu4n132t48slk77vq5.apps.googleusercontent.com"
const val AUTHCLIENTSECRET = "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"
val AUTHDEFAULTSCOPES = listOf("https://www.googleapis.com/auth/userinfo.profile")
