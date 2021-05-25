import {extendTheme} from "@chakra-ui/react";
import {createBreakpoints} from "@chakra-ui/theme-tools";

//responsive breakpoints
const breakPoints = createBreakpoints({
    sm: "576px",
    md: "768px",
    lg: "992px",
    xl: "1200px"
})

//global styles
const styles = {
    global: {
        h1: {
            fontSize: "2em"
        },
        h2: {
            fontSize: "1.5em"
        },
        h3: {
            fontSize: "1.15em"
        },
        h4: {
            fontSize: '1em'
        },
        h5: {
            fontSize: '0.85em'
        },
        h6: {
            fontSize: '0.75em'
        }
    }
}

const theme = extendTheme({breakPoints, styles});

export default theme;