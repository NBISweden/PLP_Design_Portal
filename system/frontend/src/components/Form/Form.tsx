import {Field} from "../Field/Field";
import {InputField} from "../InputField/InputField";
import {FormEventHandler} from "react";
import "./Form.css";

interface FormProps {
    handleSubmit: FormEventHandler;
}

export function Form({ handleSubmit }: FormProps) {
    return <form onSubmit={handleSubmit}>
        <fieldset className="box">
            <legend className="label is-size-5 has-text-weight-medium has-text-grey-dark">Source sequences for target
                design
            </legend>
            <Field id="source_sequence.gene_transcript_name_or_fasta" widget={((props) => (<InputField {...props} type="textarea" rows={5}/>))}  />
            <div className="columns is-vcentered">
                <div className="column">
                    <Field id="source_sequence.attribute_identifier"/>
                </div>
                <div className="column">
                    <Field id="source_sequence.feature_identifier"/>
                </div>
            </div>
            <Field id="source_sequence.fasta_source_sequence_absent"/>
        </fieldset>
        <fieldset className="box">
            <legend className="label is-size-5 has-text-weight-medium has-text-grey-dark">Probe design</legend>
            <div className="columns is-vcentered">
                <div className="column">
                    <Field id="probe_design.probe_arm_length"/>
                </div>
                <div className="column">
                    <Field id="probe_design.min_genome_distance"/>
                </div>
            </div>
            <Field id="probe_design.use_hamming_distance"/>
            <Field id="probe_design.only_one_unique_arm"/>
            <Field id="probe_design.allow_overlapping_probes"/>
        </fieldset>
        <fieldset className="box">
            <legend className="label is-size-5 has-text-weight-medium has-text-grey-dark">Color code</legend>
            <div className="columns is-vcentered">
                <div className="column">
                    <Field id="color_code.amount_of_colors"/>
                </div>
                <div className="column">
                    <Field id="color_code.length_of_code"/>
                </div>
            </div>
        </fieldset>
        <fieldset className="box">
            <legend className="label is-size-5 has-text-weight-medium has-text-grey-dark">Anchor and spacer sequences
            </legend>
            <div className="columns is-vcentered">
                <div className="column">
                    <Field id="anchor_and_spacer.anchor" widget={((props) => (<InputField {...props} type="textarea" rows={1}/>))}/>
                </div>
                <div className="column">
                    <Field id="anchor_and_spacer.spacer_left" widget={((props) => (<InputField {...props} type="textarea" rows={1}/>))}/>
                </div>
                <div className="column">
                    <Field id="anchor_and_spacer.spacer_right" widget={((props) => (<InputField {...props} type="textarea" rows={1}/>))}/>
                </div>
            </div>
        </fieldset>
        <fieldset className="box">
            <legend className="label is-size-5 has-text-weight-medium has-text-grey-dark">Genome</legend>
            <Field id="genome.genome"/>
        </fieldset>
        <button type="submit" className="button is-pulled-right has-background-grey has-text-white">Launch analysis
        </button>
        <button type="submit" className="button is-pulled-right has-background-grey has-text-white">Show example
        </button>
    </form>;
}