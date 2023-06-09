import { App, Editor, FileSystemAdapter, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, addIcon } from 'obsidian';
import {PythonShell} from 'python-shell';
import { AngryReviewerScript } from 'angry-reviewer-script';
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	english: string;
	notesFolder: string;
	notesFile: string;
	splitSetting: string;
	dateFormat: string;
	storeNotes: boolean;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	english: 'american',
	notesFolder: 'AngryReviewerNotes/',
	notesFile: 'AngryReviewerNotes.md',
	splitSetting: 'vertical',
	dateFormat: "YYYYMMDDhhmmss",
	storeNotes: false
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

	runAngryReview(text:string): string {
		new Notice('Running Angry Reviewer.');
		let options = {
			mode: 'json'
		};


		PythonShell.runString(AngryReviewerScript(text, this.settings.english), options).then (messages => {

			this.presentNotes(messages[0])


		});
		return true;
	}

	setCursorInLine(rawLine: number) {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) return;
		const viewState = view.leaf.getViewState();
		if (viewState.state.mode !== "source") {
			viewState.state.mode = "source";
			view.leaf.setViewState(viewState);
		}

		const line = Math.min(rawLine - 1, view.editor.lineCount() - 1);
		view.editor.focus();
		view.editor.setCursor({
			line: line,
			ch: 0,
		});
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

	prepareNotes(notes:any, filepath:str)
	{
		let note_string = "";
		filepath = encodeURIComponent(filepath);
		for(let i = 0; i < notes.length; i++)
		{
			if(notes[i].substr(0,4) == "Line")
				{
					let line_number = notes[i].substring(
						notes[i].indexOf(" ") + 1, 
						notes[i].indexOf(".")
					);
					let raw_note = notes[i].replace(`Line ${line_number}. `, "");

					let clickable_line = `[Line ${line_number}](obsidian://angry-reviewer?line=${line_number}&file=${filepath}). `;
					note_string += clickable_line + raw_note + "\n\n";
				} else {
					note_string += notes[i] + "\n\n";
				}
		}
		note_string += "---\nThese notes were generated by [Angry Reviewer](https://www.angryreviewer.com)";
		return note_string;

	}

	async presentNotes(notes:any)
	{
		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		let filepath = markdownView.file?.path;
		let leaf = this.app.workspace.createLeafBySplit(this.app.workspace.getMostRecentLeaf(), this.settings.splitSetting);
		if(this.settings.storeNotes)
			{
				let dir_exists = await this.app.vault.adapter.exists(this.settings.notesFolder);
				if(!dir_exists)
					{
						this.app.vault.adapter.mkdir(this.settings.notesFolder);
					}
					const file = await this.app.vault.create(
						`${this.settings.notesFolder}/${this.getDate(
							new Date(),
							this.settings.dateFormat
						)}.md`,
						this.prepareNotes(notes, filepath)
					);
					await leaf.openFile(file);
			} else {
				let file_exists = await this.app.vault.adapter.exists(this.settings.notesFile);
				if(!file_exists)
					{
						let file = await this.app.vault.create(
							this.settings.notesFile,
							this.prepareNotes(notes, filepath)
						);
						await leaf.openFile(file);
					} else {
						await leaf.openFile(this.app.vault.getAbstractFileByPath(this.settings.notesFile));
						this.app.workspace.getActiveViewOfType(MarkdownView).setViewData(this.prepareNotes(notes, filepath));
					}

			}
	}



	async onload() {
		await this.loadSettings();


		addIcon(
			"angry-reviewer",
			'<svg  viewBox="0 0 62.23343 51.744268" version="1.1" id="svg5" inkscape:version="1.2.2 (b0a8486541, 2022-12-01)" sodipodi:docname="icon_mini.svg" inkscape:export-filename="/home/r/logo.png" inkscape:export-xdpi="28.785948" inkscape:export-ydpi="28.785948" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"> <sodipodi:namedview id="namedview7" pagecolor="#ffffff" bordercolor="#666666" borderopacity="1.0" inkscape:pageshadow="2" inkscape:pageopacity="0.0" inkscape:pagecheckerboard="0" inkscape:document-units="mm" showgrid="false" fit-margin-top="0.8" fit-margin-left="0" fit-margin-right="0" fit-margin-bottom="0.8" inkscape:zoom="1.1759259" inkscape:cx="-20.409449" inkscape:cy="1.2755906" inkscape:window-width="1890" inkscape:window-height="1014" inkscape:window-x="15" inkscape:window-y="51" inkscape:window-maximized="1" inkscape:current-layer="layer1" inkscape:showpageshadow="2" inkscape:deskcolor="#d1d1d1" /> <defs id="defs2" /> <g inkscape:label="Layer 1" inkscape:groupmode="layer" id="layer1" transform="translate(-15.484661,-24.431784)"> <rect style="fill:none;fill-opacity:1;stroke:currentColor;stroke-width:2.62;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" id="rect20385" width="26.616009" height="25.069975" x="17.493086" y="39.554588" ry="4.3613544" inkscape:export-filename="/home/r/logo_big.png" inkscape:export-xdpi="69.600845" inkscape:export-ydpi="69.600845" /> <path style="fill:currentColor;fill-opacity:1;stroke:none;stroke-width:0.278415;stroke-opacity:1" id="path1591-7" sodipodi:type="arc" sodipodi:cx="32.486332" sodipodi:cy="55.313175" sodipodi:rx="2.5625603" sodipodi:ry="2.6512764" sodipodi:start="0" sodipodi:end="6.201311" sodipodi:open="true" sodipodi:arc-type="arc" d="m 35.048892,55.313175 a 2.5625603,2.6512764 0 0 1 -2.510112,2.650721 2.5625603,2.6512764 0 0 1 -2.612861,-2.542215 2.5625603,2.6512764 0 0 1 2.403156,-2.754785 2.5625603,2.6512764 0 0 1 2.711233,2.42945" inkscape:export-filename="/home/r/logo_big.png" inkscape:export-xdpi="69.600845" inkscape:export-ydpi="69.600845" /> <rect style="fill:none;fill-opacity:1;stroke:currentColor;stroke-width:2.62;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" id="rect20764" width="26.616009" height="25.069975" x="49.243088" y="39.554588" ry="4.1923556" inkscape:export-filename="/home/r/logo_big.png" inkscape:export-xdpi="69.600845" inkscape:export-ydpi="69.600845" /> <path style="fill:currentColor;fill-opacity:1;stroke:none;stroke-width:0.278415;stroke-opacity:1" id="path22311" sodipodi:type="arc" sodipodi:cx="60.940495" sodipodi:cy="55.131821" sodipodi:rx="2.5625603" sodipodi:ry="2.6512764" sodipodi:start="0" sodipodi:end="6.201311" sodipodi:open="true" sodipodi:arc-type="arc" d="m 63.503055,55.131821 a 2.5625603,2.6512764 0 0 1 -2.510112,2.650721 2.5625603,2.6512764 0 0 1 -2.612862,-2.542216 2.5625603,2.6512764 0 0 1 2.403157,-2.754785 2.5625603,2.6512764 0 0 1 2.711233,2.429451" inkscape:export-filename="/home/r/logo_big.png" inkscape:export-xdpi="69.600845" inkscape:export-ydpi="69.600845" /> <path style="fill:none;stroke:currentColor;stroke-width:3.03863;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="m 38.726914,71.669916 c 4.83315,-1.801587 10.829166,-2.117971 15.896695,-0.07408" id="path23642" sodipodi:nodetypes="cc" inkscape:export-filename="/home/r/logo_big.png" inkscape:export-xdpi="69.600845" inkscape:export-ydpi="69.600845" /> <path style="fill:none;stroke:currentColor;stroke-width:3.265;stroke-linecap:round;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1" d="m 46.879966,41.649714 c 0.811895,0 28.198992,-12.638389 28.198992,-12.638389" id="path1756" sodipodi:nodetypes="cc" /> <path style="fill:none;stroke:currentColor;stroke-width:3.265;stroke-linecap:round;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1" d="m 46.543647,41.649714 c -0.811895,0 -28.356337,-12.638389 -28.356337,-12.638389" id="path1758" sodipodi:nodetypes="cc" /> </g> </svg>'
			);

			// This creates an icon in the left ribbon.
			const ribbonIconEl = this.addRibbonIcon('angry-reviewer', 'Run Angry Reviewer', (evt: MouseEvent) => {
				this.startAngryReview();
			});


			this.registerObsidianProtocolHandler("angry-reviewer", async (e) => {
				if(e.line != null && e.file != null)
					{
						let fileIsAlreadyOpened = false;
						app.workspace.iterateAllLeaves((leaf) => {
							if (leaf.view.file?.path === e.file) {
								if (fileIsAlreadyOpened && leaf.width == 0) return;
								fileIsAlreadyOpened = true;

								app.workspace.setActiveLeaf(leaf, { focus: true });
								this.setCursorInLine(e.line);
							}
						});

						if(!fileIsAlreadyOpened)
							{
								let leaf = this.app.workspace.createLeafBySplit(this.app.workspace.getMostRecentLeaf(), this.settings.splitSetting);
								await leaf.openFile(this.app.vault.getAbstractFileByPath(e.file));
								this.setCursorInLine(e.line);
							}
					}
			});



			// This adds an editor command that can perform some operation on the current editor instance
			this.addCommand({
				id: 'run-angry-reviewer',
				name: 'Run Angry Reviewer on current document',
				editorCallback: (editor: Editor, view: MarkdownView) => {
					this.startAngryReview();
				}
			});

			this.addSettingTab(new AngryReviewerSettingTab(this.app, this));
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

		containerEl.createEl('h2', {text: 'Angry Reviewer Settings'});

		new Setting(containerEl)
		.setName('Store notes in Notes Folder')
		.setDesc('If set to false, notes will appear in (and override previous contents of) the Notes File at Vault root. If true, a new file will be made each time the reviewer is run, and stored in the Notes Folder.')
		.addToggle(toggle => toggle
							 .setValue(this.plugin.settings.storeNotes)
							 .onChange(async (value) => {
								 this.plugin.settings.storeNotes = value;
								 await this.plugin.saveSettings();
							 })
							);
							new Setting(containerEl)
							.setName('Notes Folder')
							.setDesc('Folder (from Vault root) in which to store the notes.')
							.addText(text => text
											 .setPlaceholder('Enter folder path.')
											 .setValue(this.plugin.settings.notesFolder)
											 .onChange(async (value) => {
												 this.plugin.settings.notesFolder = value;
												 await this.plugin.saveSettings();
											 }));
											 new Setting(containerEl)
											 .setName('Notes File')
											 .setDesc('Name of file in which to store the notes.')
											 .addText(text => text
																.setPlaceholder('Enter file name.')
																.setValue(this.plugin.settings.notesFile)
																.onChange(async (value) => {
																	this.plugin.settings.notesFile = value;
																	await this.plugin.saveSettings();
																}));
																new Setting(containerEl)
																.setName('English Setting')
																.addDropdown(dropdown => dropdown
																						 .addOption("american", "American English")
																						 .addOption("british", "British English")
																						 .setValue(this.plugin.settings.english)
																						 .onChange(async (value) => {
																							 this.plugin.settings.english = value;
																							 await this.plugin.saveSettings();
																						 }));
																						 new Setting(containerEl)
																						 .setName('Split setting')
																						 .setDesc('Whether the new window should split right or split top.')
																						 .addDropdown(dropdown => dropdown
																													.addOption("vertical", "Split right")
																													.addOption("horizontal", "Split top")
																													.setValue(this.plugin.settings.splitSetting)
																													.onChange(async (value) => {
																														this.plugin.settings.splitSetting = value;
																														await this.plugin.saveSettings();
																													}));
	}
}
