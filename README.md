# IEM Valid Time Extent Code (VTEC) App

The source code driving the [IEM VTEC App](https://mesonet.agron.iastate.edu/vtec/).

## Development procedure

There are some convoluted things happening here to support the IEM website's
template system.  In general, the following is happening.

1. `npm start` runs vite with a simple HTML wrapper around `src/_index_content.html`
   to support development.

The build then becomes.

1. `src/_index_content.html` contains the &gt;main&lt; HTML static content.
2. `npm run build` generates the assets and a manifest used by the IEM website
   to load the proper JS/CSS along with the static `_index_content.html` file.

## Notes

We are tied to bootstrap 3 due to IEM's ISU theme still stuck with that
version.
