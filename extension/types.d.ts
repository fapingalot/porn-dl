declare namespace browser {
    interface IListener<Callback extends Function = () => void> {
        addListener(callback: Callback): void;
        removeListener(listener: any): void;
        hasListener(listener: any): boolean;
    }

    namespace runtime {
        interface Port { }
    }
    namespace browserAction {
        const onClicked: IListener;
    }
    namespace extensionTypes {
        type ImageFormat = string;
        interface ImageDetails {
            format?: ImageFormat
            quality?: number;
        }
    }
    namespace tabs {
        type MutedInfoReason = "capture" | "extension" | "user";
        interface MutedInfo {
            extensionId?: string
            muted: boolean;
            reason?: MutedInfoReason
        }
        interface PageSettings {
            edgeBottom?: number;
            edgeLeft?: number;
            edgeRight?: number;
            edgeTop?: number;

            footerCenter?: string;
            footerLeft?: string;
            footerRight?: string;
            headerCenter?: string;
            headerLeft?: string;
            headerRight?: string;
            marginBottom?: number;
            marginLeft?: number;
            marginRight?: number;
            marginTop?: number;
            orientation?: number;
            paperHeight?: number;
            paperSizeUnit?: number;
            paperWidth?: number;
            scaling?: number;
            showBackgroundColors?: boolean;
            showBackgroundImages?: boolean;
            shrinkToFit?: boolean;
        }

        interface Tab {
            active: boolean;
            attention?: boolean;
            audible?: boolean;
            autoDiscardable?: boolean;
            cookieStoreId?: string;
            discarded?: boolean;
            favIconUrl?: string;
            height?: number;
            hidden: boolean;
            highlighted: boolean;
            id?: number;
            incognito: boolean
            index: number;
            isArticle: boolean;
            isInReaderMode: boolean;
            lastAccessed: number;
            mutedInfo?: MutedInfo;
            openerTabId?: number;
            pinned: boolean;
            selected: boolean;
            sessionId?: string;
            status?: TabStatus;
            successorId?: string;
            title?: string;
            url?: string;
            width?: number;
            windowId: number;


            // haringState: { camera: boolean, microphone: boolean, screen: undefined }
            // successorTabId: number;
        }
        type TabStatus = "loading" | "complete";
        type WindowType = "normal" | "popup" | "panel" | "devtools";
        type ZoomSettingsMode = "automatic" | "disabled" | "manual";
        type ZoomSettingsScope = "per-origin" | "per-tab";
        interface ZoomSettings {
            defaultZoomFactor?: number;
            mode?: ZoomSettingsMode;
            scope?: ZoomSettingsScope;
        }


        // Consts
        const TAB_ID_NONE: number;


        // Methods
        function captureTab(tabId: number, options: browser.extensionTypes.ImageDetails): Promise<string>;
        function captureVisibleTab(windowId: number, options: browser.extensionTypes.ImageDetails): Promise<string>;
        function query(queryInfo: { active?: boolean, audible?: boolean, autoDiscardable?: boolean, cookieStoreId?: string, currentWindow?: boolean, discarded?: boolean, hidden?: boolean, highlighted?: boolean, index?: number, muted?: boolean, lastFocusedWindow?: boolean, pinned?: boolean, status?: TabStatus, title?: string, url?: string | string[], windowId?: number, windowType?: WindowType }): Promise<Tab[]>;

    }
    namespace notifications {
        type TemplateType = "basic" | "image" | "list" | "progress";
        interface NotificationOptions {
            type: TemplateType;
            message: string;
            title: string;
            iconUrl?: string;
            contextMessage?: string;
            priority?: 0 | 1 | 2;
            eventTime?: number;
            buttons?: { title: string, iconUrl?: string }[];
            imageUrl?: string;
            items?: { title: string, message: string }[];
            progress?: number;
        }

        // Methods
        function clear(id: string): Promise<boolean>;
        function create(options: NotificationOptions): Promise<string>;
        function create(id: string, options: NotificationOptions): Promise<string>;
        function gettingAll(): Promise<NotificationOptions[]>;
        function update(id: string, options: NotificationOptions): Promise<boolean>;

        // Events
        const onButtonClicked: IListener<(notificationId: string, buttonIndex: number) => void>;
        const onClicked: IListener<(notificationId: string, buttonIndex: number) => void>;
        const onClosed: IListener<(notificationId: string, buttonIndex: number) => void>;
        const onShown: IListener<(notificationId: string, buttonIndex: number) => void>;
    }
}
