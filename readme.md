# Ciquence Backend Code



[![node version](https://img.shields.io/badge/node-~v16.13.0-green)]()
[![npm version](https://img.shields.io/badge/npm-~v8.1.0-blue)]()

Project holds the codes for the backend (Express Server) and database (MongoDB) used by the application to interact with the INRDeals API.

## API Reference

HTTPS endpoints marked as `Require Authorization` can only be accessed by Firebase Users.

#### Authorization

Requests need to be authorized by providing an `Authorization` header containing the `Firebase ID Token`.

```http
Authorization: Bearer <Firebase ID Token>
```

#### Error Codes

| Code  | Description (Tentative)                      |
| :---- | :------------------------------------------- |
| `200` | Status OK                                    |
| `201` | Created                                      |
| `204` | Updated                                      |
| `304` | Not updated                                  |
| `400` | Bad request - Check query parameters         |
| `403` | Forbidden / Not allowed                      |
| `409` | Duplicate / invalid request                  |
| `404` | Not found - Possible error with INRDeals API |
| `500` | Unknown error - Check server logs            |
| `501` | Not implemented                              |

## To start the dev sever locally:

1--> npm i
2--> npm run dev
