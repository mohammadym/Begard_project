import { Component, OnInit, Output, Inject, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PostPlanService } from '../post-plan.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UpdatePlanService } from '../update-plan.service';
import { MyPlan } from './../data-storage.service'
import { environment } from 'src/environments/environment';

export interface PlanDetail {
  description: string;
  photo: string;
}


@Component({
  selector: 'app-post-dialog',
  templateUrl: './post-dialog.component.html',
  styleUrls: ['./post-dialog.component.css']
})
export class PostDialogComponent implements OnInit {
  @Output() onPostDetails: EventEmitter<any> = new EventEmitter<any>();
  description: string;
  coverBinaryString;
  public imagePath;
  imgURL: any;
  public message: string;
  saveDisabled = true;
  isUpdate = false
  plan

  constructor(
    public dialogRef: MatDialogRef<PostDialogComponent>,
    public postPlanService: PostPlanService,
    public updatePlanService: UpdatePlanService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) private data: MyPlan
  ) {
    if (data != null) {
      this.plan = data
      this.description = data.description;
      this.isUpdate = true;
      this.imgURL = environment.baseUrl + data.cover;
    }
  }


  ngOnInit(): void {
    this.updateSaveButtonDisabled()
  }

  onCancel() {
    this.dialogRef.close();
  }

  onPost() {
    if (!this.isUpdate) {
      this.postPlanService.setPostPlanDetail({ description: this.description, photo: this.coverBinaryString })
        .subscribe(status => this.handleRequestResponse(status))
    } else {
      this.plan.description = this.description;
      this.plan.cover = this.coverBinaryString;
      this.updatePlanService.updatePlan(this.plan.id, this.plan)
        .subscribe(status => this.handleRequestResponse(status))
    }
    this.dialogRef.close();
  }

  _handleReaderLoaded(readerEvt) {
    this.coverBinaryString = readerEvt.target.result;
    this.updateSaveButtonDisabled();
  }

  preview(files) {
    if (files.length === 0)
      return;

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }

    var reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    }

    var file = files[0];

    if (files && file) {
      var binaryReader = new FileReader();
      binaryReader.onload = this._handleReaderLoaded.bind(this);
      binaryReader.readAsDataURL(file);
    }
  }

  updateSaveButtonDisabled() {
    if (this.description != undefined && this.coverBinaryString != undefined) {
      if (this.description.length > 0 && this.coverBinaryString.length > 0) {
        this.saveDisabled = false;
      }
      else {
        this.saveDisabled = true;
      }
    }
    else if (this.description != undefined && this.isUpdate && this.description.length > 0) {
      this.saveDisabled = false;
    } else
      this.saveDisabled = true;
  }

  onChange(e) {
    this.updateSaveButtonDisabled;
  }

  openSnackBar(message) {
    this.snackBar.open(
      message, "", {
      duration: 3 * 1000
    }
    );
  }

  handleRequestResponse(status) {
    if (status == "200") {
      if (this.isUpdate)
        this.openSnackBar("plan updated successfully!")
      else
        this.openSnackBar("plan saved successfully!")
    }
    else {
      this.openSnackBar("something went wrong!")
    }
  }
}
