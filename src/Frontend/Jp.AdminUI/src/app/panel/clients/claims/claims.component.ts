import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { TranslatorService } from "../../../core/translator/translator.service";
import { ClientService } from "../clients.service";
import { flatMap, tap, map, debounceTime } from "rxjs/operators";
import { Client, ClientSecret, ClientProperty, Claim } from "../../../shared/viewModel/client.model";
import { ActivatedRoute, Router } from "@angular/router";
import { ToasterConfig, ToasterService } from "angular2-toaster";
import { DefaultResponse } from "../../../shared/viewModel/default-response.model";
import { Observable } from "rxjs";
import { ScopeService } from "../../../shared/services/scope.service";


@Component({
    selector: "app-client-claim",
    templateUrl: "./claims.component.html",
    styleUrls: ["./claims.component.scss"],
    providers: [ClientService, ScopeService],
    encapsulation: ViewEncapsulation.None
})
export class ClientClaimsComponent implements OnInit {

    public errors: Array<string>;
    public claimsSuggested: Array<string>;
    public model: Claim;
    public claims: Claim[];

    public toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-top-right',
        showCloseButton: true
    });
    public showButtonLoading: boolean;
    public client: string;
    public bsConfig = {
        containerClass: 'theme-angle'
    };
    public standardClaims: string[];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public translator: TranslatorService,
        private clientService: ClientService,
        public toasterService: ToasterService) { }

    public ngOnInit() {
        this.route.params.pipe(tap(p => this.client = p["clientId"])).pipe(map(p => p["clientId"])).pipe(flatMap(m => this.clientService.getClientClaims(m.toString()))).subscribe(result => this.claims = result.data);
        this.errors = [];
        this.model = new Claim();
        this.showButtonLoading = false;
        this.standardClaims = [
            "sub",
            "name",
            "given_name",
            "family_name",
            "middle_name",
            "nickname",
            "preferred_username",
            "profile",
            "picture",
            "website",
            "email",
            "email_verified",
            "gender",
            "birthdate",
            "zoneinfo",
            "locale",
            "phone_number",
            "phone_number_verified",
            "address",
            "updated_at"
        ];
    }

    public showSuccessMessage() {
        this.translator.translate.get('toasterMessages').subscribe(a => {
            this.toasterService.pop("success", a["title-success"], a["message-success"]);
        });
    }

    public selectType(type: string) {
        this.model.type = type;
    }


    public remove(id: number) {

        this.showButtonLoading = true;
        try {

            this.clientService.removeClaim(this.client, id).subscribe(
                registerResult => {
                    if (registerResult.data) {
                        this.showSuccessMessage();
                        this.loadClaims();
                    }
                    this.showButtonLoading = false;
                },
                err => {
                    this.errors = DefaultResponse.GetErrors(err).map(a => a.value);
                    this.showButtonLoading = false;
                }
            );
        } catch (error) {
            this.errors = [];
            this.errors.push("Unknown error while trying to register");
            this.showButtonLoading = false;
            return Observable.throw("Unknown error while trying to register");
        }

    }

    private loadClaims(): void {
        this.clientService.getClientClaims(this.client).subscribe(c => this.claims = c.data);
    }

    public save() {
        this.showButtonLoading = true;
        try {
            this.model.clientId = this.client;
            this.clientService.saveClaim(this.model).subscribe(
                registerResult => {
                    if (registerResult.data) {
                        this.showSuccessMessage();
                        this.loadClaims();
                        this.model = new Claim();
                    }
                    this.showButtonLoading = false;
                },
                err => {
                    this.errors = DefaultResponse.GetErrors(err).map(a => a.value);
                    this.showButtonLoading = false;
                }
            );
        } catch (error) {
            this.errors = [];
            this.errors.push("Unknown error while trying to register");
            this.showButtonLoading = false;
            return Observable.throw("Unknown error while trying to register");
        }
    }

}
