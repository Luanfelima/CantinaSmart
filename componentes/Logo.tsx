/*import { Image } from "@mantine/core";

export function LogoClaro() {
    return (
    <Image 
    src="https://i.imgur.com/itiogvI.png"
    h="100%"/>
    )
};

export default LogoClaro;*/

import { Image, Box } from "@mantine/core";

export function LogoClaro() {
    const homePageUrl = "/Dashboard/dashboard" // Insira aqui o caminho para a página inicial

    return (
        <Box component="a" href={homePageUrl} style={{ display: 'inline-block', width: 'auto', height: '100%'}}>
            <Image 
                src="https://i.imgur.com/itiogvI.png"
                style={{ height: '100%', width: 'auto' }}
            />
        </Box>
    );
};

export default LogoClaro;