<script>
import Editor from "./editor/Editor.svelte";
import Header from "./header/Header.svelte";
import { dark } from "./utils/store";

let darkMode = false;
const subscribe = dark.subscribe((value) => darkMode = value);
</script>

<div>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css" 
            integrity="sha512-KfkfwYDsLkIlwQp6LFnl8zNdLGxu9YAA1QvwINks4PhcElQSvqcyVLLD9aMhXd13uQjoXtEKNosOWaZqXgel0g==" 
            crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@40,400,0,0" />
</div>

<div class={`main-${darkMode ? 'dark' : 'light'} h-full`}>
    <!-- <p style={`color: ${adjustBrightnessToLight('#086630')}`}>
        {adjustBrightnessToLight('#086630')}
    </p>
    <p style={`color: ${'#086630'}`}>
        {'#086630'}
    </p>
    <p style={`color: ${adjustBrightnessToDark('#a1cfb4')}`}>
        {adjustBrightnessToDark('#a1cfb4')}
    </p>
    <p style={`color: ${'#a1cfb4'}`}>
        {'#a1cfb4'}
    </p> -->
    <div>
        <Header />
        <Editor />
    </div>
</div>

<style>
.main-dark {
    background-color: #2e3036;
}

.main-light {
background-color: white;
}
</style>
