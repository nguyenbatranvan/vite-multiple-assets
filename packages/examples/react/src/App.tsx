import './App.css'
import {Code, Grid} from "@mantine/core";
import {CardImage} from "./CardImage.tsx";

function App() {
    return (
        <>
            <Grid>
                <CardImage col={{span:12}} titleCard={"Background image css"} images={[]}>
                    <div style={{height:100,width:100,position:'relative'}}>

                            <div className={"bg-image"}>

                            </div>

                    </div>
                </CardImage>
                <CardImage titleCard={`Image with sub folder`} description={<>
                    From folder <Code>shared-assets</Code>
                </>} images={[{
                    src: "/base/shared/images/sub-folder/sub-image.png",
                    alt: "Vite logo",
                    className: "logo",
                    "aria-label": "img-output-subfolder"
                }, {
                    src: "/base/shared/images/sub-folder/nested-sub-folder/sub-image1.png",
                    alt: "Vite logo",
                    className: "logo",
                    "aria-label": "img-output-nested-subfolder"
                }, {
                    src: "/base/shared/images/vite.svg",
                    alt: "Vite logo",
                    className: "logo",
                    "aria-label": "logo-assets"
                }]}/>
                <CardImage titleCard={"Image Base"} description={<>
                    From folder <Code>public</Code></>} images={[{
                    src: "/base/images/settings.png",
                    "aria-label": "img-base",
                    className: "logo"
                }]}/>
                <CardImage titleCard={"Image with parent folder"} images={[{
                    src: "/base/public2/images/settings.png",
                    "aria-label": "img-base-with-parent",
                    className: "logo",
                    alt: "Vite logo"
                }]} description={<> From folder <Code>public2</Code></>}/>
                <CardImage titleCard={"Image Symlink"} images={[{
                    src: "/base/shared/images/change1.png",
                    alt: "Vite logo",
                    className: "logo",
                    "aria-label": "logo-assets-symlink"
                }]} description={<> File <Code>change1.png</Code> from folder <Code>shared-assets</Code></>}/>
            </Grid>
        </>
    )
}

export default App
