import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    useMapEvents
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

function MapClickHandler({ setLocation }) {
    useMapEvents({
        click(event) {
            const latitude = event.latlng.lat;
            const longitude = event.latlng.lng;

            setLocation({
                latitude,
                longitude
            });
        }
    });

    return null;
}

function MapCenter({ location }) {
    const map = useMap();

    if (location) {
        map.flyTo(
            [location.latitude, location.longitude],
            17
        );
    }

    return null;
}

function LocationPicker({ location, setLocation }) {
    const defaultPosition = [17.9133, 77.5301];

    const mapPosition = location
        ? [location.latitude, location.longitude]
        : defaultPosition;

    return (
        <div>
            <h3>Select Road Damage Location</h3>

            <MapContainer
                center={defaultPosition}
                zoom={14}
                style={{
                    height: "400px",
                    width: "100%"
                }}
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapClickHandler
                    setLocation={setLocation}
                />

                {location && (
                    <>
                        <Marker position={mapPosition} />
                        <MapCenter location={location} />
                    </>
                )}
            </MapContainer>

            {location && (
                <div>
                    <p>
                        <strong>Selected Location</strong>
                    </p>

                    <p>
                        Latitude: {location.latitude}
                    </p>

                    <p>
                        Longitude: {location.longitude}
                    </p>
                </div>
            )}
        </div>
    );
}

export default LocationPicker;