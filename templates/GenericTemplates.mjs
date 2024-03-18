import {create, signal} from "https://fjs.targoninc.com/f.js"

export class GenericTemplates {
    static progressText(type, progress, done) {
        const merged = signal(`Generating ${type.value}: ${progress.value}%`);
        progress.subscribe((newProgress) => {
            merged.value = `Generating ${type.value}: ${newProgress}%`;
        });
        type.subscribe((newType) => {
            merged.value = `Generating ${newType}: ${progress.value}%`;
        });

        return create("div")
            .classes("flex-v")
            .id("progressText")
            .children(
                GenericTemplates.list(done, GenericTemplates.progressDone),
                create("span")
                    .text(merged)
                    .build()
            ).build();
    }

    static materialIcon(icon) {
        return create("i")
            .classes("material-icons", icon)
            .text(icon)
            .build();
    }

    static progressDone(text) {
        return create("div")
            .classes("flex", "align-content")
            .children(
                GenericTemplates.materialIcon("done"),
                create("span")
                    .text(text)
                    .build()
            ).build();
    }

    static list(items, itemTemplate) {
        let template = signal(null);
        const update = (newItems) => {
            template.value = create("div")
                .classes("flex-v")
                .children(
                    ...newItems.map((item) => itemTemplate(item))
                ).build();
        }
        update(items.value);
        items.subscribe(update);
        return template;
    }

    static button(text, onclick) {
        return create("button")
            .text(text)
            .onclick(onclick)
            .build();
    }
}