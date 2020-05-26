import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
type Thing = {
    name: string;
    info?: string;
};

@Component({
    selector: 'main',
    template: require('./main.html'),
    styles: [require('./main.css')],
})
export class MainComponent implements OnInit {

    awesomeThings: Thing[] = [];
    newThing = '';

    static parameters = [HttpClient];
    constructor(http: HttpClient) {
        this.http = http;
    }

    ngOnInit() {
        return this.http.get('/api/things')
            .subscribe((things: Thing[]) => {
                this.awesomeThings = things;
            });
    }


    addThing() {
        if(this.newThing) {
            let text = this.newThing;
            this.newThing = '';

            return this.http.post('/api/things', { name: text })
                .subscribe(thing => {
                    console.log('Added Thing:', thing);
                });
        }
    }

    deleteThing(thing) {
        return this.http.delete(`/api/things/${thing._id}`)
            .subscribe(() => {
                console.log('Deleted Thing');
            });
    }
}
