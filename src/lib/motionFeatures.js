import { domAnimation } from "framer-motion";

// Loaded lazily through LazyMotion (see main.jsx): the animation renderer
// lands in its own chunk so the critical bundle only carries the slim `m`
// runtime. entry-server.jsx imports it synchronously for prerendering.
export default domAnimation;
