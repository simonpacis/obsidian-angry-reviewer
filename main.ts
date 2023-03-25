import { App, Editor, FileSystemAdapter, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, addIcon } from 'obsidian';
import {PythonShell} from 'python-shell';
import { AngryReviewerScript } from 'angry-reviewer-script';
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
	notesFolder: string;
	dateFormat: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	notesFolder: 'AngryReviewerNotes/',
	dateFormat: "YYYYMMDDhhmmss",
}

export default class AngryReviewerPlugin extends Plugin {
	settings: MyPluginSettings;

	startAngryReview()
	{
		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (markdownView) {

			this.runAngryReview(markdownView.getViewData());
		}
	}

	runAngryReview(text:string, english="american"): string {
		new Notice('Running Angry Reviewer.');
		let options = {
			mode: 'json'
		};

		PythonShell.runString(atob(AngryReviewerScript) + '\nobsidian_func("""'+text+'""", "'+english+'")', options).then (messages => {

			this.presentNotes(messages[0])


		});
		return true;
	}

	getDate(date: Date, format = "YYYYMMDDhhmmss") {
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const hour = date.getHours();
		const minute = date.getMinutes();
		const second = date.getSeconds();

		const paddedMonth = month.toString().padStart(2, "0");
		const paddedDay = day.toString().padStart(2, "0");
		const paddedHour = hour.toString().padStart(2, "0");
		const paddedMinute = minute.toString().padStart(2, "0");
		const paddedSecond = second.toString().padStart(2, "0");

		return format
		.replace("YYYY", year.toString())
		.replace("MM", paddedMonth)
		.replace("DD", paddedDay)
		.replace("hh", paddedHour)
		.replace("mm", paddedMinute)
		.replace("ss", paddedSecond);
	}

	prepareNotes(notes:any)
	{
		let note_string = "";
		for(let i = 0; i < notes.length; i++)
		{
			note_string += notes[i] + "\n\n";
		}
		note_string += "---\nThese notes were generated by [Angry Reviewer](https://www.angryreviewer.com)";
		return note_string;

	}

	async presentNotes(notes:any)
	{
		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		let leaf = this.app.workspace.createLeafBySplit(this.app.workspace.getMostRecentLeaf(), "vertical");
		const file = await this.app.vault.create(
			`${this.settings.notesFolder}/${this.getDate(
				new Date(),
				this.settings.dateFormat
			)}.md`,
			this.prepareNotes(notes)
		);
		await leaf.openFile(file);
	}



	async onload() {
		await this.loadSettings();

		addIcon(
			"angry-reviewer",
			'<svg xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"  viewBox="0 0 93.002786 70.629153" version="1.1" id="svg5" inkscape:version="1.1 (c4e8f9ed74, 2021-05-24)" sodipodi:docname="logo.svg" inkscape:export-filename="/home/r/logo.png" inkscape:export-xdpi="28.785948" inkscape:export-ydpi="28.785948"> <sodipodi:namedview id="namedview7" pagecolor="#ffffff" bordercolor="#666666" borderopacity="1.0" inkscape:pageshadow="2" inkscape:pageopacity="0.0" inkscape:pagecheckerboard="0" inkscape:document-units="mm" showgrid="false" fit-margin-top="0.8" fit-margin-left="0" fit-margin-right="0" fit-margin-bottom="0.8" inkscape:zoom="0.83150518" inkscape:cx="149.72847" inkscape:cy="128.6823" inkscape:window-width="1920" inkscape:window-height="1080" inkscape:window-x="0" inkscape:window-y="0" inkscape:window-maximized="1" inkscape:current-layer="layer1"/> <defs id="defs2"/> <g inkscape:label="Layer 1" inkscape:groupmode="layer" id="layer1" transform="translate(-1.9152158,-2.0721898)"> <path fill="currentColor" style="fill-opacity:1;stroke:none;stroke-width:0.264582px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" d="M 40.416525,60.891613 4.0282578,60.971973 21.954474,52.530964 1.9152158,37.333842 23.036175,36.095186 13.785941,7.9404928 36.568843,24.628816 45.739781,2.8721898 56.428973,25.368105 79.67953,7.3166658 71.704985,35.516472 94.917999,39.103793 71.59333,53.643139 89.403313,61.33979 53.256621,61.178386 Z" id="path857" sodipodi:nodetypes="cccccccccccccccc" inkscape:export-filename="/home/r/logo_big.png" inkscape:export-xdpi="69.600845" inkscape:export-ydpi="69.600845"/> <rect style="fill:#ffffff;fill-opacity:1;stroke:#788491;stroke-width:2.62;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" id="rect20385" width="26.616009" height="25.069975" x="17.493086" y="39.554588" ry="4.3613544" inkscape:export-filename="/home/r/logo_big.png" inkscape:export-xdpi="69.600845" inkscape:export-ydpi="69.600845"/> <path fill="currentColor" style="fill-opacity:1;stroke:none;stroke-width:0.278415;stroke-opacity:1" id="path1591-7" sodipodi:type="arc" sodipodi:cx="32.486332" sodipodi:cy="55.313175" sodipodi:rx="2.5625603" sodipodi:ry="2.6512764" sodipodi:start="0" sodipodi:end="6.201311" sodipodi:open="true" sodipodi:arc-type="arc" d="m 35.048892,55.313175 a 2.5625603,2.6512764 0 0 1 -2.510112,2.650721 2.5625603,2.6512764 0 0 1 -2.612861,-2.542215 2.5625603,2.6512764 0 0 1 2.403156,-2.754785 2.5625603,2.6512764 0 0 1 2.711233,2.42945" inkscape:export-filename="/home/r/logo_big.png" inkscape:export-xdpi="69.600845" inkscape:export-ydpi="69.600845"/> <rect style="fill:#ffffff;fill-opacity:1;stroke:#788491;stroke-width:2.62;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" id="rect20764" width="26.616009" height="25.069975" x="49.243088" y="39.554588" ry="4.1923556" inkscape:export-filename="/home/r/logo_big.png" inkscape:export-xdpi="69.600845" inkscape:export-ydpi="69.600845"/> <path style="fill:#fffeff;fill-opacity:1;stroke:#ffffff;stroke-width:3;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="m 46.37454,40.406589 21.094966,-8.27416" id="path3761" sodipodi:nodetypes="cc" inkscape:export-filename="/home/r/logo_big.png" inkscape:export-xdpi="69.600845" inkscape:export-ydpi="69.600845"/> <path style="fill:none;stroke:#ffffff;stroke-width:2.02444;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="m 42.368147,49.640228 9.434742,0.06373" id="path2058" inkscape:export-filename="/home/r/logo_big.png" inkscape:export-xdpi="69.600845" inkscape:export-ydpi="69.600845"/> <path style="fill:#fffeff;fill-opacity:1;stroke:#ffffff;stroke-width:3;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="M 46.37454,40.406589 25.639595,32.744776" id="path20945" sodipodi:nodetypes="cc" inkscape:export-filename="/home/r/logo_big.png" inkscape:export-xdpi="69.600845" inkscape:export-ydpi="69.600845"/> <path fill="currentColor" style="fill-opacity:1;stroke:none;stroke-width:0.278415;stroke-opacity:1" id="path22311" sodipodi:type="arc" sodipodi:cx="60.940495" sodipodi:cy="55.131821" sodipodi:rx="2.5625603" sodipodi:ry="2.6512764" sodipodi:start="0" sodipodi:end="6.201311" sodipodi:open="true" sodipodi:arc-type="arc" d="m 63.503055,55.131821 a 2.5625603,2.6512764 0 0 1 -2.510112,2.650721 2.5625603,2.6512764 0 0 1 -2.612862,-2.542216 2.5625603,2.6512764 0 0 1 2.403157,-2.754785 2.5625603,2.6512764 0 0 1 2.711233,2.429451" inkscape:export-filename="/home/r/logo_big.png" inkscape:export-xdpi="69.600845" inkscape:export-ydpi="69.600845"/> <path style="fill:none;stroke:#788491;stroke-width:3.03863;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="m 38.662892,69.813886 c 4.83315,-1.801587 10.829166,-2.117971 15.896695,-0.07408" id="path23642" sodipodi:nodetypes="cc" inkscape:export-filename="/home/r/logo_big.png" inkscape:export-xdpi="69.600845" inkscape:export-ydpi="69.600845"/> </g> </svg>'
		);

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('angry-reviewer', 'Run Angry Reviewer', (evt: MouseEvent) => {
			this.startAngryReview();
		});

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'run-angry-reviewer',
			name: 'Run Angry Reviewer on current document',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.startAngryReview();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new AngryReviewerSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class AngryReviewerSettingTab extends PluginSettingTab {
	plugin: AngryReviewerPlugin;

	constructor(app: App, plugin: AngryReviewerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Angry Reviewer plugin.'});

		new Setting(containerEl)
		.setName('Notes Folder')
		.setDesc('Folder (from Vault root) in which to store the notes. You have to create this folder manually.')
		.addText(text => text
						 .setPlaceholder('Enter folder path.')
						 .setValue(this.plugin.settings.notesFolder)
						 .onChange(async (value) => {
							 this.plugin.settings.notesFolder = value;
							 await this.plugin.saveSettings();
						 }));
	}
}
