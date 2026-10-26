# Insight UI

The Flux block explorer's web application, a service for [Bitcore Node](https://github.com/runonflux/bitcore-node) using the [Insight API](https://github.com/runonflux/insight-api).

## Getting Started

In a bitcore Node's directory, beside `@runonflux/insight-api`:

```
npm install @runonflux/insight-ui
```

then add `@runonflux/insight-ui` to `services` in `bitcore-node.json`. bitcore-node runs it as the
service `insight-ui` (settings under `servicesConfig.insight-ui`: `apiPrefix`, `routePrefix`).

## Development

The application is the React frontend in `frontend/` (see its README); `yarn deploy` there
builds it into `public/`, which the package ships.

## Contribute

Contributions and suggestions are welcomed at the [Insight UI GitHub repository](https://github.com/runonflux/insight-ui).


## License
(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
